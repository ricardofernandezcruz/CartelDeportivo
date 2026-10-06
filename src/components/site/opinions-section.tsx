"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ColumnistCardItem = {
  slug: string;
  name: string;
  column: string;
  avatarUrl: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function OpinionsSection({ items }: { items: ColumnistCardItem[] }) {
  if (!items.length) return null;

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[var(--cartel-blue)] via-[#0a63b8] to-[#084a8a]">
      <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-[var(--cartel-red)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center font-heading text-3xl font-black uppercase tracking-tight text-white sm:mb-12 sm:text-4xl"
        >
          Opiniones
        </motion.h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="min-w-0"
            >
              <Link
                href={`/autor/${item.slug}`}
                className={cn(
                  "group flex h-full flex-col items-center rounded-2xl border border-white/15 bg-white/10 px-5 py-8 text-center backdrop-blur-sm",
                  "transition-transform duration-300 ease-out",
                  "hover:z-10 hover:scale-[1.06] hover:border-white/35 hover:bg-white/15 hover:shadow-xl hover:shadow-black/20",
                )}
              >
                <span className="relative mb-5 size-28 overflow-hidden rounded-full ring-4 ring-white/35 sm:size-32">
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.name}
                      fill
                      sizes="128px"
                      className="object-cover object-top grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0"
                      unoptimized={item.avatarUrl.startsWith("/")}
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center bg-[var(--cartel-red)] text-2xl font-bold text-white">
                      {initials(item.name)}
                    </span>
                  )}
                </span>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                  {item.column}
                </p>
                <h3 className="mt-1.5 font-heading text-xl font-black uppercase leading-tight tracking-tight text-white sm:text-2xl">
                  {item.name}
                </h3>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/80">
                  Ver perfil
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
