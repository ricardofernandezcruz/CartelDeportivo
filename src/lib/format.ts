import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { SITE_TZ, formatScheduleRd } from "@/lib/timezone";

export function formatArticleDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-DO", {
    timeZone: SITE_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatRelativeDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

/** Fecha estilo portada original: 19 DE SEPTIEMBRE DE 2026 */
export function formatOpinionDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatArticleDate(d).toUpperCase();
}

export function formatSchedule(date: Date) {
  return `${formatScheduleRd(date)} (hora RD)`;
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function readingTimeMinutes(htmlOrText: string) {
  const words = wordCount(stripHtml(htmlOrText));
  return Math.max(1, Math.round(words / 200));
}
