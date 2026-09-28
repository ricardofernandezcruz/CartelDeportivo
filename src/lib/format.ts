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
