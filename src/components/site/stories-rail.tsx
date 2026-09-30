"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ArticleCardData } from "@/components/site/article-card";

/** Carril tipo “historias” inspirado en la sección visual del sitio actual */
export function StoriesRail({ items, title = "Historias" }: { items: ArticleCardData[]; title?: string }) {
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
            <Link href={`/noticia/${item.slug}`} className="group block">
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl ring-2 ring-[var(--cartel-red)] ring-offset-2 ring-offset-background">
                {item.heroImageUrl ? (
                  <Image src={item.heroImageUrl} alt="" fill className="object-cover transition group-hover:scale-105" sizes="160px" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-[var(--cartel-blue)] to-[var(--cartel-red)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--cartel-blue)]/95 via-[var(--cartel-blue)]/25 to-transparent" />
                <p className="absolute inset-x-0 bottom-0 line-clamp-3 p-2 text-[11px] font-bold leading-tight text-white">
                  {item.title}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
