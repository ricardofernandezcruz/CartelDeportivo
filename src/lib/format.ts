import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function formatArticleDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d 'de' MMMM, yyyy", { locale: es });
}

export function formatRelativeDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

/** Fecha estilo portada original: SEPTIEMBRE 19, 2026 */
export function formatOpinionDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMMM d, yyyy", { locale: es }).toUpperCase();
}
