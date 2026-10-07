import {
  formatGamesBack,
  formatStreak,
  LIDOM_FALLBACK,
  resolveLidomTeam,
  type LidomStandingRow,
  type LidomStandingsPayload,
} from "@/lib/lidom-standings";

const MLB = "https://statsapi.mlb.com/api/v1";
const LEAGUE_ID = 131; // Liga de Béisbol Dominicano (LIDOM)
const SPORT_ID = 17; // Winter Leagues

type MlbTeamRef = { id: number; name: string };
type MlbRecord = {
  wins: number;
  losses: number;
  pct: string;
};
type MlbTeamRecord = {
  team: MlbTeamRef;
  gamesPlayed: number;
  leagueGamesBack?: string;
  clinchIndicator?: string | null;
  streak?: { streakCode?: string };
  leagueRecord: MlbRecord;
  leagueRank?: string;
};
type MlbStandingsResponse = {
  records: Array<{
    standingsType: string;
    lastUpdated?: string;
    roundRobin?: { status?: string; games?: number };
    teamRecords: MlbTeamRecord[];
  }>;
};
type MlbGame = {
  officialDate?: string;
  seriesDescription?: string;
  gameType?: string;
  status?: { detailedState?: string };
  teams: {
    away: { team: MlbTeamRef; score?: number };
    home: { team: MlbTeamRef; score?: number };
  };
};

async function mlbJson<T>(path: string): Promise<T> {
  const res = await fetch(`${MLB}${path}`, {
    headers: { "User-Agent": "CartelDeportivo/1.0 (+https://carteldeportivo.com)" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`MLB ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

function mapTeamRecords(
  records: MlbTeamRecord[],
  opts?: { markUnclinchedEliminated?: boolean },
): LidomStandingRow[] {
  return [...records]
    .sort((a, b) => Number(a.leagueRank || 99) - Number(b.leagueRank || 99))
    .map((row) => {
      const meta = resolveLidomTeam(row.team);
      const eliminated =
        opts?.markUnclinchedEliminated && !row.clinchIndicator ? true : undefined;
      return {
        team: meta.team,
        shortName: meta.shortName,
        abbr: meta.abbr,
        color: meta.color,
        accent: meta.accent,
        jj: row.gamesPlayed,
        g: row.leagueRecord.wins,
        p: row.leagueRecord.losses,
        pct: row.leagueRecord.pct,
        dif: formatGamesBack(row.leagueGamesBack),
        racha: formatStreak(row.streak?.streakCode),
        eliminated,
      };
    });
}

function seasonLabelFromYear(season: string): string {
  const y = Number(season);
  if (!Number.isFinite(y)) return `Temporada ${season}`;
  return `Temporada ${y}-${y + 1}`;
}

/** LIDOM YYYY-(YYYY+1) arranca en octubre YYYY y termina hacia febrero YYYY+1. */
export function currentLidomSeasonId(now = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santo_Domingo",
    year: "numeric",
    month: "numeric",
  });
  const bag = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const year = Number(bag.year);
  const month = Number(bag.month);
  if (month <= 2) return String(year - 1);
  return String(year);
}

async function latestLidomSeason(): Promise<string> {
  const preferred = currentLidomSeasonId();
  try {
    const data = await mlbJson<{ seasons: Array<{ seasonId: string }> }>(
      `/seasons?sportId=${SPORT_ID}&leagueId=${LEAGUE_ID}`,
    );
    const ids = (data.seasons || []).map((s) => s.seasonId);
    if (ids.includes(preferred)) return preferred;
  } catch {
    /* usar temporada local */
  }
  return preferred;
}

function computeFinalFromGames(games: MlbGame[]): LidomStandingRow[] {
  const finals = games.filter(
    (g) =>
      g.status?.detailedState === "Final" &&
      (g.seriesDescription || "").toLowerCase().includes("championship"),
  );
  if (!finals.length) return [];

  const tally = new Map<
    number,
    { team: MlbTeamRef; wins: number; losses: number; last?: "W" | "L"; streak: number }
  >();

  const bump = (team: MlbTeamRef, won: boolean) => {
    const cur = tally.get(team.id) || { team, wins: 0, losses: 0, streak: 0 };
    if (won) {
      cur.wins += 1;
      cur.streak = cur.last === "W" ? cur.streak + 1 : 1;
      cur.last = "W";
    } else {
      cur.losses += 1;
      cur.streak = cur.last === "L" ? cur.streak + 1 : 1;
      cur.last = "L";
    }
    tally.set(team.id, cur);
  };

  for (const g of finals.sort((a, b) => (a.officialDate || "").localeCompare(b.officialDate || ""))) {
    const away = g.teams.away;
    const home = g.teams.home;
    if (away.score == null || home.score == null) continue;
    const awayWon = away.score > home.score;
    bump(away.team, awayWon);
    bump(home.team, !awayWon);
  }

  return [...tally.values()]
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses)
    .map((row, i, arr) => {
      const meta = resolveLidomTeam(row.team);
      const leader = arr[0];
      const gb =
        i === 0
          ? "-"
          : formatGamesBack(String((leader.wins - row.wins + (row.losses - leader.losses)) / 2));
      const jj = row.wins + row.losses;
      const pct = jj ? (row.wins / jj).toFixed(3).replace(/^0/, "") : ".000";
      return {
        team: meta.team,
        shortName: meta.shortName,
        abbr: meta.abbr,
        color: meta.color,
        accent: meta.accent,
        jj,
        g: row.wins,
        p: row.losses,
        pct,
        dif: gb,
        racha: formatStreak(`${row.last || "W"}${row.streak || 1}`),
      } satisfies LidomStandingRow;
    });
}

async function fetchLidomStandingsUncached(): Promise<LidomStandingsPayload> {
  const season = await latestLidomSeason();
  const [standings, schedule] = await Promise.all([
    mlbJson<MlbStandingsResponse>(
      `/standings?leagueId=${LEAGUE_ID}&season=${season}&standingsTypes=regularSeason,postseason`,
    ),
    mlbJson<{ dates?: Array<{ games: MlbGame[] }> }>(
      `/schedule?sportId=${SPORT_ID}&leagueId=${LEAGUE_ID}&season=${season}&gameTypes=R,L,F,D,W,C`,
    ),
  ]);

  const regular = standings.records.find((r) => r.standingsType === "regularSeason");
  const postseason = standings.records.find((r) => r.standingsType === "postseason");
  const games = (schedule.dates || []).flatMap((d) => d.games || []);

  const regularRows = mapTeamRecords(regular?.teamRecords || [], {
    markUnclinchedEliminated: true,
  });
  const finalRows = computeFinalFromGames(games);
  const finalIds = new Set(
    finalRows.map((r) => r.shortName),
  );
  const roundRobinRows = mapTeamRecords(postseason?.teamRecords || []).map((row) => ({
    ...row,
    eliminated: finalRows.length > 0 ? !finalIds.has(row.shortName) : undefined,
  }));

  const phases = {
    regular: regularRows,
    "round-robin": roundRobinRows,
    final: finalRows,
  };

  if (!phases.regular.length) throw new Error("MLB returned empty LIDOM standings");

  const updatedAt =
    regular?.lastUpdated || postseason?.lastUpdated || new Date().toISOString();

  return {
    seasonLabel: seasonLabelFromYear(season),
    updatedAt,
    source: "mlb",
    phases,
  };
}

export async function getLidomStandings(): Promise<LidomStandingsPayload> {
  try {
    return await fetchLidomStandingsUncached();
  } catch (err) {
    console.error("[lidom] MLB fetch failed, using fallback", err);
    return LIDOM_FALLBACK;
  }
}
