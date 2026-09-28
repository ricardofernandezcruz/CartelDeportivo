"use client";

import Link from "next/link";
import type { ArticleCardData } from "@/components/site/article-card";

export function BreakingTicker({ items }: { items: ArticleCardData[] }) {
  if (!items.length) return null;

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-[var(--cartel-red)]/30 bg-[var(--cartel-red)] text-white">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <span className="flex shrink-0 items-center bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em]">
          Última hora
        </span>
        <div className="relative flex-1 overflow-hidden py-2">
          <div className="animate-ticker flex w-max gap-8 whitespace-nowrap px-4">
            {doubled.map((item, i) => (
              <Link
                key={`${item.slug}-${i}`}
                href={`/noticia/${item.slug}`}
                className="text-sm font-semibold hover:underline"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
