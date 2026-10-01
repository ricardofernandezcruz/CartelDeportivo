"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CARTEL_TV_CLIPS,
  youtubeEmbedUrl,
  youtubeThumb,
  youtubeWatchUrl,
  type CartelTvClip,
} from "@/lib/cartel-tv";
import { YoutubeIcon } from "@/components/site/social-icons";
import { cn } from "@/lib/utils";

const PER_PAGE = 3;

async function shareClip(clip: CartelTvClip) {
  const url = youtubeWatchUrl(clip.youtubeId);
  try {
    if (navigator.share) {
      await navigator.share({ title: clip.title, text: clip.title, url });
      return;
    }
  } catch {
    /* cancelado */
  }
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function CartelTvSection({ clips = CARTEL_TV_CLIPS }: { clips?: CartelTvClip[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [page, setPage] = useState(0);

  const current = clips[index] ?? clips[0];
  const pageCount = Math.max(1, Math.ceil(clips.length / PER_PAGE));
  const pageClips = clips.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  useEffect(() => {
    setPlaying(false);
  }, [index]);

  useEffect(() => {
    setPage(Math.floor(index / PER_PAGE));
  }, [index]);

  if (!current) return null;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 bg-[#f4f6f8]" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-b from-[var(--cartel-red)] to-[#c40808]" />

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Logo oficial */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 flex justify-center"
        >
          <Image
            src="/brand/cartel-tv-logo.png"
            alt="Cartel Deportivo TV"
            width={350}
            height={100}
            className="h-auto w-[220px] drop-shadow-md sm:w-[280px]"
            priority
          />
        </motion.div>

        {/* Player principal — 16:9 compacto */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="overflow-hidden rounded-2xl border border-white/25 bg-[var(--cartel-dark)] shadow-2xl shadow-black/25"
        >
          <div className="relative aspect-video w-full bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {playing ? (
                  <iframe
                    title={current.title}
                    src={youtubeEmbedUrl(current.youtubeId, true)}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <Image
                      src={youtubeThumb(current.youtubeId)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:1024px) 100vw, 960px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/65" />
                    <button
                      type="button"
                      onClick={() => setPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label="Reproducir video"
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cartel-red)] text-white shadow-lg ring-4 ring-white/20 transition hover:scale-105 sm:h-16 sm:w-16">
                        <Play className="ml-0.5 h-6 w-6 fill-current sm:h-7 sm:w-7" />
                      </span>
                    </button>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {!playing && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start gap-3 p-3 sm:p-4">
                <Avatar className="size-9 ring-2 ring-white/35 sm:size-10">
                  <AvatarImage src={current.avatarUrl} alt={current.author} />
                  <AvatarFallback className="bg-[var(--cartel-blue)] text-xs text-white">CD</AvatarFallback>
                </Avatar>
                <div className="min-w-0 pt-0.5">
                  <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow sm:line-clamp-2">
                    {current.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/75">{current.author}</p>
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 p-3 sm:p-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => shareClip(current)}
                aria-label="Compartir"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <a
                href={youtubeWatchUrl(current.youtubeId)}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25",
                )}
              >
                <YoutubeIcon className="h-4 w-4" />
                Ver en YouTube
              </a>
            </div>
          </div>
        </motion.div>

        {/* Carrusel simétrico */}
        <div className="mt-7 text-white">
          <h3 className="mb-4 line-clamp-2 min-h-[2.75rem] font-heading text-base font-black uppercase leading-tight tracking-tight sm:min-h-[3.25rem] sm:text-xl">
            {current.title}
          </h3>

          <div className="relative px-1 sm:px-2">
            <button
              type="button"
              aria-label="Anterior"
              className="absolute -left-1 top-[28%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur hover:bg-black/40 sm:-left-2 sm:h-9 sm:w-9"
              onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              className="absolute -right-1 top-[28%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur hover:bg-black/40 sm:-right-2 sm:h-9 sm:w-9"
              onClick={() => setPage((p) => (p + 1) % pageCount)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {pageClips.map((clip, i) => {
                  const absoluteIndex = page * PER_PAGE + i;
                  const active = absoluteIndex === index;
                  return (
                    <motion.button
                      key={clip.id}
                      type="button"
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIndex(absoluteIndex)}
                      className="group flex h-full flex-col text-left"
                    >
                      <div
                        className={cn(
                          "relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-black/30 transition",
                          active
                            ? "ring-2 ring-white shadow-lg shadow-black/20"
                            : "ring-1 ring-white/20 hover:ring-white/50",
                        )}
                      >
                        <Image
                          src={youtubeThumb(clip.youtubeId, "mq")}
                          alt=""
                          fill
                          className="object-cover transition group-hover:scale-105"
                          sizes="(max-width:640px) 100vw, 280px"
                        />
                        <div className="absolute inset-0 bg-black/35" />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[var(--cartel-red)] shadow">
                            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                          </span>
                        </span>
                      </div>
                      {/* Altura fija → filas simétricas */}
                      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-snug text-white/95 sm:min-h-[2.6rem] sm:text-[13px]">
                        {clip.title}
                      </p>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Página ${i + 1}`}
                onClick={() => setPage(i)}
                className={cn(
                  "h-2 rounded-full transition",
                  i === page ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
