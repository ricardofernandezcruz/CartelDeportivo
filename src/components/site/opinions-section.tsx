"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatOpinionDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type OpinionItem = {
  slug: string;
  title: string;
  publishedAt?: Date | null;
  category: { name: string; slug: string };
  author: { name: string; avatarUrl?: string | null };
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function OpinionsSection({ items }: { items: OpinionItem[] }) {
  if (!items.length) return null;

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[var(--cartel-blue)] via-[#0a63b8] to-[#084a8a]">
      <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-[var(--cartel-red)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center font-heading text-3xl font-black uppercase tracking-tight text-white sm:mb-10 sm:text-4xl"
        >
          Opiniones
        </motion.h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {items.map((item, i) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <Link
                href={`/noticia/${item.slug}`}
                className={cn(
                  "group flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm transition",
                  "hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 hover:shadow-lg hover:shadow-black/10",
                )}
              >
                <Avatar
                  size="lg"
                  className="size-14 shrink-0 ring-2 ring-white/40 sm:size-16"
                >
                  {item.author.avatarUrl ? (
                    <AvatarImage src={item.author.avatarUrl} alt={item.author.name} />
                  ) : null}
                  <AvatarFallback className="bg-[var(--cartel-red)] text-sm font-bold text-white">
                    {initials(item.author.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                    {item.category.name}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-heading text-sm font-black uppercase leading-snug tracking-tight text-white group-hover:text-white sm:text-[15px]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                    {formatOpinionDate(item.publishedAt)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
