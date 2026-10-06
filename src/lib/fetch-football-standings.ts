import {
  FOOTBALL_FALLBACK,
  FOOTBALL_LEAGUES,
  type FootballLeagueId,
  type FootballLeagueMeta,
  type FootballLeagueStandings,
  type FootballStandingRow,
  type FootballStandingsPayload,
} from "@/lib/football-leagues";

const ESPN = "https://site.api.espn.com/apis/v2/sports/soccer";

// ESPN responde 403 a User-Agents personalizados; hay que imitar un navegador.
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

type EspnStat = { name: string; value?: number; displayValue?: string };

type EspnEntry = {
  team: {
    id: string;
    displayName: string;
    shortDisplayName?: string;
    abbreviation?: string;
    logos?: { href: string }[];
  };
  note?: { color?: string; description?: string; rank?: number } | null;
  stats: EspnStat[];
};

type EspnStandingsResponse = {
  name?: string;
  abbreviation?: string;
  children?: Array<{
    abbreviation?: string;
    standings?: {
      season?: number;
      seasonDisplayName?: string;
      entries?: EspnEntry[];
    };
  }>;
};

function statValue(stats: EspnStat[], name: string): number {
  const stat = stats.find((s) => s.name === name);
  if (!stat) return 0;
  if (typeof stat.value === "number" && Number.isFinite(stat.value)) return stat.value;
  const parsed = Number(stat.displayValue);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** ESPN usa `##RRGGBB` en algunas notas; lo normalizamos. */
function normalizeColor(color?: string): string | undefined {
  if (!color) return undefined;
  const clean = color.replace(/^#+/, "");
  return /^[0-9a-f]{3,8}$/i.test(clean) ? `#${clean}` : undefined;
}

function seasonLabel(seasonDisplayName?: string, abbreviation?: string, season?: number): string {
  if (abbreviation && /^\d{4}(-\d{2,4})?$/.test(abbreviation)) {
    return `Temporada ${abbreviation}`;
  }
  const match = seasonDisplayName?.match(/(\d{4}-\d{2,4})/);
  if (match) return `Temporada ${match[1]}`;
  if (season) return `Temporada ${season}-${String(season + 1).slice(-2)}`;
  return "Temporada en curso";
}

function mapEntries(entries: EspnEntry[]): FootballStandingRow[] {
  return entries
    .map((entry) => {
      const stats = entry.stats;
      const zoneColor = normalizeColor(entry.note?.color ?? undefined);

      return {
        rank: statValue(stats, "rank"),
        team: entry.team.displayName,
        shortName: entry.team.shortDisplayName || entry.team.displayName,
        abbr: entry.team.abbreviation || entry.team.displayName.slice(0, 3).toUpperCase(),
        crest: entry.team.logos?.[0]?.href ?? null,
        played: statValue(stats, "gamesPlayed"),
        win: statValue(stats, "wins"),
        draw: statValue(stats, "ties"),
        loss: statValue(stats, "losses"),
        gf: statValue(stats, "pointsFor"),
        ga: statValue(stats, "pointsAgainst"),
        gd: statValue(stats, "pointDifferential"),
        points: statValue(stats, "points"),
        zone:
          entry.note?.description && zoneColor
            ? { label: entry.note.description, color: zoneColor }
            : null,
      } satisfies FootballStandingRow;
    })
    .sort((a, b) => a.rank - b.rank || b.points - a.points);
}

async function fetchLeague(league: FootballLeagueMeta): Promise<FootballLeagueStandings> {
  const res = await fetch(`${ESPN}/${league.espn}/standings`, {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`ESPN ${league.espn} → ${res.status}`);

  const data = (await res.json()) as EspnStandingsResponse;
  const child = data.children?.[0];
  const entries = child?.standings?.entries ?? [];
  if (!entries.length) throw new Error(`ESPN ${league.espn} sin posiciones`);

  return {
    leagueId: league.id,
    leagueName: league.name,
    seasonLabel: seasonLabel(
      child?.standings?.seasonDisplayName,
      child?.abbreviation,
      child?.standings?.season,
    ),
    updatedAt: new Date().toISOString(),
    source: "espn",
    rows: mapEntries(entries),
  };
}

export async function getFootballLeagueStandings(
  leagueId: FootballLeagueId,
): Promise<FootballLeagueStandings> {
  const league = FOOTBALL_LEAGUES.find((l) => l.id === leagueId);
  if (!league) return FOOTBALL_FALLBACK[leagueId];

  try {
    return await fetchLeague(league);
  } catch (err) {
    console.error(`[futbol] ESPN falló para ${leagueId}, usando fallback`, err);
    return FOOTBALL_FALLBACK[leagueId];
  }
}

/** Trae las cuatro ligas en paralelo para que el cambio en el cliente sea instantáneo. */
export async function getAllFootballStandings(): Promise<FootballStandingsPayload> {
  const results = await Promise.all(
    FOOTBALL_LEAGUES.map(async (league) => {
      try {
        return await fetchLeague(league);
      } catch (err) {
        console.error(`[futbol] ESPN falló para ${league.id}, usando fallback`, err);
        return FOOTBALL_FALLBACK[league.id];
      }
    }),
  );

  return Object.fromEntries(
    results.map((result) => [result.leagueId, result]),
  ) as FootballStandingsPayload;
}
