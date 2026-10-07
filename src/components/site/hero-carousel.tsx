"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { HeroSlideMedia } from "@/components/site/hero-slide-media";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ArticleCardData } from "@/components/site/article-card";
import { cn } from "@/lib/utils";

export function HeroCarousel({ slides }: { slides: ArticleCardData[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  const current = slides[index];

  return (
    <section className="relative overflow-hidden border-b border-[var(--cartel-blue)]/15 bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--cartel-red)] via-white to-[var(--cartel-blue)]" />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-md ring-2 ring-[var(--cartel-blue)]/20 sm:aspect-[4/3] lg:aspect-square">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0"
              >
                <HeroSlideMedia src={current.heroImageUrl} title={current.title} />
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              aria-label="Anterior"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[var(--cartel-blue)] p-2 text-white shadow-md hover:bg-[var(--cartel-red)]"
              onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[var(--cartel-blue)] p-2 text-white shadow-md hover:bg-[var(--cartel-red)]"
              onClick={() => setIndex((i) => (i + 1) % slides.length)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <Link href={`/noticia/${current.slug}`} className="group">
                  <h2 className="font-heading text-3xl font-black uppercase leading-[0.95] tracking-tight text-foreground group-hover:text-[var(--cartel-red)] sm:text-4xl lg:text-[2.75rem]">
                    {current.title}
                  </h2>
                </Link>
                {current.excerpt && (
                  <p className="mt-4 line-clamp-3 text-base leading-relaxed text-muted-foreground">
                    {current.excerpt}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <ul className="mt-8 space-y-3 border-t-2 border-[var(--cartel-blue)]/20 pt-6">
              {slides.map((slide, i) => (
                <li key={slide.slug}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "w-full border-l-4 pl-3 text-left font-heading text-sm font-bold uppercase leading-snug transition sm:text-base",
                      i === index
                        ? "border-[var(--cartel-red)] text-[var(--cartel-red)]"
                        : "border-transparent text-foreground/55 hover:border-[var(--cartel-blue)] hover:text-[var(--cartel-blue)]",
                    )}
                  >
                    {slide.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
