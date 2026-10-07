export const SITE_NAME = "Cartel Deportivo";
export const SITE_TAGLINE = "Lo más completo en deportes";

export function siteOrigin() {
  const raw = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${p}`;
}
