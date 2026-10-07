const PLACEHOLDER_HOSTS = /picsum\.photos|pravatar\.cc|dicebear\.com/i;
const RICKROLL_ID = "dQw4w9WgXcQ";

const PICSUM_SEED_TO_PLACEHOLDER: Record<string, string> = {
  "cartel-beisbol": "/brand/placeholders/beisbol.svg",
  "cartel-beisbol-b": "/brand/placeholders/beisbol.svg",
  "cartel-mlb": "/brand/placeholders/mlb.svg",
  "cartel-mlb-b": "/brand/placeholders/mlb.svg",
  "cartel-futbol": "/brand/placeholders/futbol.svg",
  "cartel-futbol-b": "/brand/placeholders/futbol.svg",
  "cartel-premier": "/brand/placeholders/futbol.svg",
  "cartel-laliga": "/brand/placeholders/futbol.svg",
  "cartel-seriea": "/brand/placeholders/futbol.svg",
  "cartel-ligue1": "/brand/placeholders/futbol.svg",
  "cartel-boxeo": "/brand/placeholders/boxeo.svg",
  "cartel-basket": "/brand/placeholders/baloncesto.svg",
  "cartel-tennis": "/brand/placeholders/general.svg",
  "cartel-stadium": "/brand/placeholders/beisbol.svg",
};

export function isDemoMediaUrl(url?: string | null) {
  if (!url) return true;
  return PLACEHOLDER_HOSTS.test(url);
}

export function publicImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  const seed = url.match(/picsum\.photos\/seed\/([^/]+)/i)?.[1];
  if (seed) return PICSUM_SEED_TO_PLACEHOLDER[seed] ?? "/brand/placeholders/general.svg";
  if (PLACEHOLDER_HOSTS.test(url)) return null;
  return url;
}

export function publicAvatarUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  if (PLACEHOLDER_HOSTS.test(url)) return null;
  return url;
}

export function publicYoutubeId(id?: string | null): string | null {
  if (!id || id === RICKROLL_ID) return null;
  return id;
}

export function isSvgUrl(url: string) {
  return /\.svg(\?|$)/i.test(url);
}

export function isCloudinaryUrl(url: string) {
  return /res\.cloudinary\.com\//i.test(url) && url.includes("/image/upload/");
}

/** Cloudinary f_auto/q_auto already serves WebP/AVIF; SVG cannot go through the optimizer. */
export function unoptimizedImage(url: string) {
  return isSvgUrl(url) || isCloudinaryUrl(url);
}

export function deliveryImageUrl(url: string, width = 1600) {
  if (!isCloudinaryUrl(url)) return url;
  const marker = "/image/upload/";
  const i = url.indexOf(marker);
  if (i < 0) return url;
  const rest = url.slice(i + marker.length);
  if (/^(f_|c_|q_|w_|h_|g_|x_|y_)/.test(rest) || rest.includes(",")) return url;
  return `${url.slice(0, i + marker.length)}f_auto,q_auto,c_limit,w_${width}/${rest}`;
}
