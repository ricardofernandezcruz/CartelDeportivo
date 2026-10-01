export type CartelTvClip = {
  id: string;
  title: string;
  youtubeId: string;
  author: string;
  avatarUrl: string;
};

/** Clips destacados estilo Cartel Deportivo TV (YouTube). */
export const CARTEL_TV_CLIPS: CartelTvClip[] = [
  {
    id: "wilhelm-lawrence",
    title: "Presidente Águilas Cibaeñas Wilhelm Lawrence derrocha optimismo.",
    youtubeId: "ZX7JoVuPBLs",
    author: "Cartel Deportivo · Pappy Pérez",
    avatarUrl: "/brand/pappy-perez.png",
  },
  {
    id: "chilote",
    title: "En su 83.º aniversario, Chilote recuerda sus 50 jonrones y nosotros, sus 300 fouls.",
    youtubeId: "F4V-RX4dBWQ",
    author: "Cartel Deportivo · Pappy Pérez",
    avatarUrl: "/brand/pappy-perez.png",
  },
  {
    id: "aguilas-fase-1",
    title: "Águilas en fase 1: abren campamento 2026-2027",
    youtubeId: "wwy2jLaAWCg",
    author: "Cartel Deportivo · Pappy Pérez",
    avatarUrl: "/brand/pappy-perez.png",
  },
  {
    id: "gg-aguilucho",
    title: "El GG aguilucho, Gian Guzmán define los primeros pasos del equipo.",
    youtubeId: "Ao3zg1JbcoY",
    author: "Cartel Deportivo · Pappy Pérez",
    avatarUrl: "/brand/pappy-perez.png",
  },
  {
    id: "liberato",
    title: "Luis Liberato admite firmó con Águilas por ser el equipo que se adapta a su juego.",
    youtubeId: "5Ebw1cx5k8A",
    author: "Cartel Deportivo · Pappy Pérez",
    avatarUrl: "/brand/pappy-perez.png",
  },
  {
    id: "plan-lidom",
    title: "Águilas atacaron puntos débiles sin quebrar su núcleo, camino a LIDOM 2026-27",
    youtubeId: "ut1dFn2rI0o",
    author: "Cartel Deportivo · Opinión",
    avatarUrl: "/brand/pappy-perez.png",
  },
];

export function youtubeThumb(id: string, quality: "hq" | "mq" | "sd" = "hq") {
  return `https://i.ytimg.com/vi/${id}/${quality}default.jpg`;
}

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string, autoplay = false) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
