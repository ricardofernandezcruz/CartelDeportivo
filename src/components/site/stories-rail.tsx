"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ArticleCardData } from "@/components/site/article-card";
import { publicImageUrl } from "@/lib/media";
import { SiteImage } from "@/components/site/site-image";

const STORY_MS = 6500;

/** Carril tipo “historias” con visor a pantalla en móvil. */
export function StoriesRail({ items, title = "Historias" }: { items: ArticleCardData[]; title?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items.length) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[var(--cartel-blue)]">{title}</p>
      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, i) => (
          <motion.div
            key={item.slug}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="w-[140px] shrink-0 sm:w-[160px]"
          >
            <button type="button" onClick={() => setOpenIndex(i)} className="group block w-full text-left">
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl ring-2 ring-[var(--cartel-red)] ring-offset-2 ring-offset-background">
                {(() => {
                  const cover = publicImageUrl(item.heroImageUrl);
                  return cover ? (
                    <SiteImage
                      src={cover}
                      alt=""
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="160px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--cartel-blue)] to-[var(--cartel-red)]" />
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--cartel-blue)]/95 via-[var(--cartel-blue)]/25 to-transparent" />
                <p className="absolute inset-x-0 bottom-0 line-clamp-3 p-2 text-[11px] font-bold leading-tight text-white">
                  {item.title}
                </p>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
      {openIndex !== null && (
        <StoryViewer items={items} start={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </section>
  );
}

function StoryViewer({
  items,
  start,
  onClose,
}: {
  items: ArticleCardData[];
  start: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(start);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (index >= items.length - 1) onClose();
      else setIndex((i) => i + 1);
    }, STORY_MS);
    return () => window.clearTimeout(id);
  }, [index, items.length, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(items.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [items.length, onClose]);

  const item = items[index];
  const cover = publicImageUrl(item?.heroImageUrl);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-0 sm:p-6" role="dialog" aria-modal aria-label="Historia">
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-black sm:h-[min(92vh,780px)] sm:rounded-2xl">
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
          {items.map((_, i) => (
            <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full bg-white"
                style={{
                  width: i < index ? "100%" : i === index ? "100%" : "0%",
                  animation: i === index ? `story-progress ${STORY_MS}ms linear` : undefined,
                }}
              />
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-7 z-10 rounded-full bg-black/40 p-2 text-white"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative min-h-0 flex-1">
          {cover ? (
            <SiteImage
              src={cover}
              alt=""
              fill
              className="object-cover"
              sizes="500px"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--cartel-blue)] to-[var(--cartel-red)]" />
          )}
          <button
            type="button"
            className="absolute inset-y-0 left-0 w-1/3"
            aria-label="Anterior"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 w-1/3"
            aria-label="Siguiente"
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-16">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">{item.category.name}</p>
            <p className="mt-1 font-heading text-2xl font-black uppercase leading-tight text-white">{item.title}</p>
            <Link
              href={`/noticia/${item.slug}`}
              className="mt-4 inline-flex rounded-full bg-[var(--cartel-red)] px-4 py-2 text-xs font-bold uppercase text-white"
            >
              Leer la nota
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes story-progress { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }`}</style>
    </div>
  );
}
