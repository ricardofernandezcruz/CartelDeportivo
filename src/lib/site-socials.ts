/** Cuentas oficiales del Grupo Pappy Pérez / Cartel Deportivo. */
export const CARTEL_SOCIAL_URLS = {
  facebook: "https://www.facebook.com/pappyperez",
  x: "https://x.com/grupopappyperez",
  instagram: "https://www.instagram.com/pappyperez/",
  tiktok: "https://www.tiktok.com/@pappyperez",
} as const;

export const SITE_SOCIALS = [
  { label: "Facebook", href: CARTEL_SOCIAL_URLS.facebook },
  { label: "X", href: CARTEL_SOCIAL_URLS.x },
  { label: "Instagram", href: CARTEL_SOCIAL_URLS.instagram },
  { label: "YouTube", href: "https://www.youtube.com/@Carteldeportivopappyperez" },
  { label: "TikTok", href: CARTEL_SOCIAL_URLS.tiktok },
] as const;
