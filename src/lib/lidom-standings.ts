export type LidomPhase = "regular" | "round-robin" | "final";

export type LidomStandingRow = {
  team: string;
  shortName: string;
  abbr: string;
  color: string;
  accent: string;
  jj: number;
  g: number;
  p: number;
  pct: string;
  dif: string;
  racha: string;
  eliminated?: boolean;
};

export type LidomStandingsPayload = {
  seasonLabel: string;
  updatedAt: string | null;
  source: "mlb" | "fallback";
  phases: Record<LidomPhase, LidomStandingRow[]>;
};

export const LIDOM_PHASES: { id: LidomPhase; label: string }[] = [
  { id: "regular", label: "Serie Regular" },
  { id: "round-robin", label: "Round Robin" },
  { id: "final", label: "Serie Final" },
];

/** Metadatos de marca por teamId MLB / nombre. */
export const LIDOM_TEAMS: Record<
  number,
  { team: string; shortName: string; abbr: string; color: string; accent: string; aliases: string[] }
> = {
  667: {
    team: "Águilas Cibaeñas",
    shortName: "Águilas",
    abbr: "AC",
    color: "#f5c518",
    accent: "#1a1a1a",
    aliases: ["aguilas", "aguilas cibaenas", "águilas"],
  },
  668: {
    team: "Toros del Este",
    shortName: "Toros",
    abbr: "TE",
    color: "#e87722",
    accent: "#ffffff",
    aliases: ["toros", "toros del este"],
  },
  669: {
    team: "Estrellas Orientales",
    shortName: "Estrellas",
    abbr: "EO",
    color: "#1b7a3d",
    accent: "#ffffff",
    aliases: ["estrellas", "estrellas orientales"],
  },
  670: {
    team: "Gigantes del Cibao",
    shortName: "Gigantes",
    abbr: "GC",
    color: "#8b1a2b",
    accent: "#ffffff",
    aliases: ["gigantes", "gigantes del cibao"],
  },
  671: {
    team: "Leones del Escogido",
    shortName: "Escogido",
    abbr: "LE",
    color: "#c8102e",
    accent: "#ffffff",
    aliases: ["leones", "leones del escogido", "escogido"],
  },
  672: {
    team: "Tigres del Licey",
    shortName: "Licey",
    abbr: "TL",
    color: "#0054a6",
    accent: "#ffffff",
    aliases: ["tigres", "tigres del licey", "licey"],
  },
};

export function resolveLidomTeam(input: { id?: number; name?: string }) {
  if (input.id && LIDOM_TEAMS[input.id]) return LIDOM_TEAMS[input.id];
  const key = (input.name || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  for (const meta of Object.values(LIDOM_TEAMS)) {
    if (meta.aliases.some((a) => key.includes(a.normalize("NFD").replace(/\p{M}/gu, "")))) {
      return meta;
    }
  }
  return {
    team: input.name || "Equipo",
    shortName: input.name || "Equipo",
    abbr: (input.name || "EQ").slice(0, 2).toUpperCase(),
    color: "#0054a6",
    accent: "#ffffff",
    aliases: [],
  };
}

export function formatStreak(code?: string | null): string {
  if (!code) return "—";
  const m = code.match(/^([WL])(\d+)$/i);
  if (!m) return code;
  return `${m[1].toUpperCase() === "W" ? "G" : "P"} ${m[2]}`;
}

export function formatGamesBack(value?: string | null): string {
  if (!value || value === "-" || value === "0" || value === "0.0") return "-";
  const n = Number(value);
  if (Number.isFinite(n)) return Number.isInteger(n) ? String(n) : String(n);
  return value.replace(/\.0$/, "");
}

/** Fallback offline / si MLB no responde. */
export const LIDOM_FALLBACK: LidomStandingsPayload = {
  seasonLabel: "Temporada 2026-2027",
  updatedAt: null,
  source: "fallback",
  phases: {
    regular: [
      {
        team: "Águilas Cibaeñas",
        shortName: "Águilas",
        abbr: "AC",
        color: "#f5c518",
        accent: "#1a1a1a",
        jj: 49,
        g: 32,
        p: 17,
        pct: ".653",
        dif: "-",
        racha: "P 1",
      },
      {
        team: "Toros del Este",
        shortName: "Toros",
        abbr: "TE",
        color: "#e87722",
        accent: "#ffffff",
        jj: 49,
        g: 27,
        p: 22,
        pct: ".551",
        dif: "5",
        racha: "G 2",
      },
      {
        team: "Gigantes del Cibao",
        shortName: "Gigantes",
        abbr: "GC",
        color: "#8b1a2b",
        accent: "#ffffff",
        jj: 50,
        g: 24,
        p: 26,
        pct: ".480",
        dif: "8.5",
        racha: "G 4",
      },
      {
        team: "Leones del Escogido",
        shortName: "Escogido",
        abbr: "LE",
        color: "#c8102e",
        accent: "#ffffff",
        jj: 50,
        g: 23,
        p: 27,
        pct: ".460",
        dif: "9.5",
        racha: "G 1",
      },
      {
        team: "Estrellas Orientales",
        shortName: "Estrellas",
        abbr: "EO",
        color: "#1b7a3d",
        accent: "#ffffff",
        jj: 50,
        g: 22,
        p: 28,
        pct: ".440",
        dif: "10.5",
        racha: "P 1",
        eliminated: true,
      },
      {
        team: "Tigres del Licey",
        shortName: "Licey",
        abbr: "TL",
        color: "#0054a6",
        accent: "#ffffff",
        jj: 50,
        g: 21,
        p: 29,
        pct: ".420",
        dif: "11.5",
        racha: "P 3",
        eliminated: true,
      },
    ],
    "round-robin": [],
    final: [],
  },
};
