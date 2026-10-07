"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ColumnistCardItem = {
  slug: string;
  name: string;
  column: string;
  role?: string;
  avatarUrl: string;
};

const CARD_BACKGROUNDS = [
  "bg-[#cfeee0]",
  "bg-[#f3d7c4]",
  "bg-[#f3cdd6]",
  "bg-[#cfe4f4]",
] as const;

/** Crop tightness differs per PNG; zoom so faces share the same visual size. */
const PORTRAIT_ZOOM: Record<string, string> = {
  "domingo-hernandez": "scale-[1.16]",
  "rafael-baldayac": "scale-[1.14]",
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
    <section className="relative isolate overflow-hidden border-y border-[var(--cartel-blue)]/15 bg-[#e8f1fb]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <p className="mb-5 inline-flex items-center rounded-full bg-[var(--cartel-blue)] px-6 py-2.5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-md sm:px-7 sm:py-3 sm:text-base">
            Opiniones
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Las firmas detrás del Cartel
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Columnistas de Cartel Deportivo: béisbol, boxeo e historia, con la misma voz de siempre.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Link
              key={item.slug}
              href={`/autor/${item.slug}`}
              className="group relative block min-w-0 pb-5"
            >
              <div
                className={cn(
                  "relative aspect-[4/5] overflow-hidden rounded-[1.35rem] rounded-tl-[2.75rem]",
                  "ring-2 ring-transparent transition duration-300",
                  "group-hover:ring-[#3dba6e] group-hover:ring-offset-2 group-hover:ring-offset-[#e8f1fb]",
                  CARD_BACKGROUNDS[i % CARD_BACKGROUNDS.length],
                )}
              >
                {item.avatarUrl ? (
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 top-10 origin-top sm:top-12",
                      PORTRAIT_ZOOM[item.slug],
                    )}
                  >
                    <Image
                      src={item.avatarUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 280px"
                      className="origin-bottom object-cover object-[center_top] grayscale transition-[filter,transform] duration-500 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                      unoptimized={item.avatarUrl.startsWith("/")}
                    />
                  </div>
                ) : (
                  <span className="flex size-full items-center justify-center font-heading text-4xl font-black text-foreground/30">
                    {initials(item.name)}
                  </span>
                )}
              </div>

              <div className="absolute inset-x-3 -bottom-1 rounded-2xl border border-border/70 bg-white px-4 py-3 shadow-md transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold leading-tight text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.column}</p>
                  </div>
                  <ChevronsRight className="size-5 shrink-0 text-foreground/70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
