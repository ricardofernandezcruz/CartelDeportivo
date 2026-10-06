export type FootballLeagueId = "premier" | "laliga" | "serie-a" | "ligue-1";

export type FootballLeagueMeta = {
  id: FootballLeagueId;
  /** Código de liga en la API de ESPN */
  espn: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  /** Color de acento de la liga (cabecera, pill activo) */
  accent: string;
  /** Slug de etiqueta sugerido para asociar noticias en el admin */
  tagSlug: string;
  /** Palabras clave para emparejar noticias cuando no hay etiqueta */
  keywords: string[];
};

export const FOOTBALL_LEAGUES: FootballLeagueMeta[] = [
  {
    id: "premier",
    espn: "eng.1",
    name: "Premier League",
    shortName: "Premier",
    country: "Inglaterra",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    accent: "#3d195b",
    tagSlug: "premier-league",
    keywords: [
      "premier league",
      "premier",
      "manchester city",
      "manchester united",
      "arsenal",
      "liverpool",
      "chelsea",
      "tottenham",
      "newcastle",
      "aston villa",
      "everton",
      "west ham",
      "brighton",
      "brentford",
      "crystal palace",
      "fulham",
      "wolverhampton",
      "nottingham",
    ],
  },
  {
    id: "laliga",
    espn: "esp.1",
    name: "La Liga",
    shortName: "La Liga",
    country: "España",
    flag: "🇪🇸",
    accent: "#e4002b",
    tagSlug: "laliga",
    keywords: [
      "laliga",
      "la liga",
      "real madrid",
      "barcelona",
      "barça",
      "atlético de madrid",
      "atletico de madrid",
      "sevilla",
      "real betis",
      "villarreal",
      "athletic club",
      "real sociedad",
      "valencia",
      "celta",
      "girona",
      "rayo vallecano",
      "osasuna",
    ],
  },
  {
    id: "serie-a",
    espn: "ita.1",
    name: "Serie A",
    shortName: "Serie A",
    country: "Italia",
    flag: "🇮🇹",
    accent: "#008fd7",
    tagSlug: "serie-a",
    keywords: [
      "serie a",
      "calcio",
      "juventus",
      "inter de milán",
      "inter de milan",
      "inter",
      "milan",
      "napoli",
      "roma",
      "lazio",
      "atalanta",
      "fiorentina",
      "bologna",
      "torino",
      "udinese",
      "genoa",
      "sassuolo",
    ],
  },
  {
    id: "ligue-1",
    espn: "fra.1",
    name: "Ligue 1",
    shortName: "Ligue 1",
    country: "Francia",
    flag: "🇫🇷",
    accent: "#091c3e",
    tagSlug: "ligue-1",
    keywords: [
      "ligue 1",
      "psg",
      "paris saint-germain",
      "paris saint germain",
      "marsella",
      "olympique de marsella",
      "mónaco",
      "monaco",
      "lyon",
      "lille",
      "niza",
      "nice",
      "rennes",
      "lens",
      "nantes",
      "toulouse",
      "estrasburgo",
    ],
  },
];

export const FOOTBALL_LEAGUE_BY_ID: Record<FootballLeagueId, FootballLeagueMeta> =
  Object.fromEntries(FOOTBALL_LEAGUES.map((l) => [l.id, l])) as Record<
    FootballLeagueId,
    FootballLeagueMeta
  >;

export type FootballZone = {
  label: string;
  color: string;
};

export type FootballStandingRow = {
  rank: number;
  team: string;
  shortName: string;
  abbr: string;
  crest?: string | null;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  zone?: FootballZone | null;
};

export type FootballLeagueStandings = {
  leagueId: FootballLeagueId;
  leagueName: string;
  seasonLabel: string;
  updatedAt: string | null;
  source: "espn" | "fallback";
  rows: FootballStandingRow[];
};

export type FootballStandingsPayload = Record<FootballLeagueId, FootballLeagueStandings>;

/** Normaliza texto para comparaciones sin acentos ni mayúsculas. */
export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

type MatchableArticle = {
  title: string;
  excerpt?: string | null;
  contentHtml?: string | null;
  tags?: { tag: { name: string; slug: string } }[];
};

/**
 * Decide si una noticia pertenece a una liga: primero por etiqueta,
 * luego por palabras clave en titular, bajada y cuerpo.
 */
export function articleMatchesLeague(article: MatchableArticle, league: FootballLeagueMeta) {
  if (article.tags?.some((t) => t.tag.slug === league.tagSlug)) return true;

  const haystack = normalizeText(
    [article.title, article.excerpt ?? "", article.contentHtml ?? ""].join(" "),
  );

  return league.keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
}

export function groupArticlesByLeague<T extends MatchableArticle>(articles: T[]) {
  const grouped = {} as Record<FootballLeagueId, T[]>;
  for (const league of FOOTBALL_LEAGUES) {
    grouped[league.id] = articles.filter((a) => articleMatchesLeague(a, league));
  }
  return grouped;
}

function fallbackLeague(
  league: FootballLeagueMeta,
  rows: Array<[string, string, number, number, number, number, number, number]>,
): FootballLeagueStandings {
  return {
    leagueId: league.id,
    leagueName: league.name,
    seasonLabel: "Temporada en curso",
    updatedAt: null,
    source: "fallback",
    rows: rows.map(([team, abbr, played, win, draw, loss, gf, ga], i) => ({
      rank: i + 1,
      team,
      shortName: team,
      abbr,
      crest: null,
      played,
      win,
      draw,
      loss,
      gf,
      ga,
      gd: gf - ga,
      points: win * 3 + draw,
      zone:
        i < 4
          ? { label: "Champions League", color: "#81D6AC" }
          : i < 6
            ? { label: "Europa League", color: "#B5E7CE" }
            : null,
    })),
  };
}

/** Datos mínimos si ESPN no responde (solo para que la UI nunca quede vacía). */
export const FOOTBALL_FALLBACK: FootballStandingsPayload = {
  premier: fallbackLeague(FOOTBALL_LEAGUE_BY_ID.premier, [
    ["Manchester City", "MNC", 5, 5, 0, 0, 13, 5],
    ["Arsenal", "ARS", 5, 4, 1, 0, 11, 4],
    ["Liverpool", "LIV", 5, 3, 1, 1, 10, 6],
    ["Chelsea", "CHE", 5, 3, 0, 2, 9, 7],
    ["Tottenham", "TOT", 5, 2, 2, 1, 8, 6],
    ["Newcastle", "NEW", 5, 2, 1, 2, 7, 7],
  ]),
  laliga: fallbackLeague(FOOTBALL_LEAGUE_BY_ID.laliga, [
    ["Barcelona", "BAR", 7, 7, 0, 0, 18, 5],
    ["Real Madrid", "RMA", 7, 5, 1, 1, 15, 7],
    ["Atlético de Madrid", "ATM", 7, 4, 2, 1, 12, 8],
    ["Athletic Club", "ATH", 7, 4, 1, 2, 11, 9],
    ["Real Betis", "BET", 7, 3, 2, 2, 10, 9],
    ["Villarreal", "VIL", 7, 3, 1, 3, 9, 10],
  ]),
  "serie-a": fallbackLeague(FOOTBALL_LEAGUE_BY_ID["serie-a"], [
    ["AS Roma", "ROM", 5, 4, 1, 0, 11, 4],
    ["Napoli", "NAP", 5, 4, 0, 1, 10, 5],
    ["Inter", "INT", 5, 3, 1, 1, 10, 6],
    ["Juventus", "JUV", 5, 3, 1, 1, 9, 6],
    ["AC Milan", "MIL", 5, 2, 2, 1, 8, 6],
    ["Atalanta", "ATA", 5, 2, 1, 2, 8, 8],
  ]),
  "ligue-1": fallbackLeague(FOOTBALL_LEAGUE_BY_ID["ligue-1"], [
    ["Mónaco", "MON", 5, 4, 1, 0, 12, 5],
    ["Paris Saint-Germain", "PSG", 5, 4, 0, 1, 13, 6],
    ["Marsella", "MAR", 5, 3, 1, 1, 10, 7],
    ["Lille", "LIL", 5, 3, 0, 2, 9, 7],
    ["Lyon", "LYO", 5, 2, 2, 1, 8, 7],
    ["Niza", "NIC", 5, 2, 1, 2, 7, 8],
  ]),
};
