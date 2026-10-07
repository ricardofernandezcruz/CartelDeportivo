export const SITE_TZ = "America/Santo_Domingo";
export const SITE_TZ_LABEL = "Hora de República Dominicana";
export const SITE_TZ_IANA = "America/Santo_Domingo";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function partsInTz(date: Date, timeZone = SITE_TZ): DateParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const bag = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatDdMmYyyy(date: Date, timeZone = SITE_TZ) {
  const p = partsInTz(date, timeZone);
  return `${pad(p.day)}/${pad(p.month)}/${p.year}`;
}

export function formatHm(date: Date, timeZone = SITE_TZ) {
  const p = partsInTz(date, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export function parseDdMmYyyy(value: string): { year: number; month: number; day: number } | null {
  const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/** Interpreta fecha+hora civiles en America/Santo_Domingo y devuelve ISO UTC. */
export function santoDomingoToIso(dateDdMmYyyy: string, timeHm: string): string | null {
  const d = parseDdMmYyyy(dateDdMmYyyy);
  const t = timeHm.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!d || !t) return null;
  const hour = Number(t[1]);
  const minute = Number(t[2]);
  if (hour > 23 || minute > 59) return null;

  const utcGuess = Date.UTC(d.year, d.month - 1, d.day, hour, minute);
  const shown = partsInTz(new Date(utcGuess), SITE_TZ);
  const shownAsUtc = Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute);
  const offset = shownAsUtc - utcGuess;
  return new Date(utcGuess - offset).toISOString();
}

export function isoToSantoDomingoFields(iso?: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  return { date: formatDdMmYyyy(d), time: formatHm(d) };
}

export function formatScheduleRd(date: Date) {
  return new Intl.DateTimeFormat("es-DO", {
    timeZone: SITE_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
