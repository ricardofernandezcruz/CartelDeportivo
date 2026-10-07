import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
} from "@/components/site/social-icons";

export type ColumnistSocials = {
  facebook?: string;
  x?: string;
  tiktok?: string;
  instagram?: string;
};

export type ColumnistCardItem = {
  slug: string;
  name: string;
  column: string;
  role?: string;
  avatarUrl: string;
  latestArticle?: { slug: string; title: string } | null;
  socials?: ColumnistSocials;
};

const SOCIAL_ITEMS = [
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "x", label: "X", Icon: XIcon },
  { key: "tiktok", label: "TikTok", Icon: TikTokIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
] as const;

const CARD_THEMES = [
  { card: "bg-[#dbeafe]", avatar: "bg-[#93c5fd]" },
  { card: "bg-[#e8eaee]", avatar: "bg-[#c5c9d1]" },
  { card: "bg-[#d1fae5]", avatar: "bg-[#86efac]" },
  { card: "bg-[#fce7f3]", avatar: "bg-[#f9a8d4]" },
] as const;

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
    <section className="relative isolate border-y border-[var(--cartel-blue)]/15 bg-[#e8f1fb]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
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

        <div className="grid grid-cols-1 gap-x-5 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const theme = CARD_THEMES[i % CARD_THEMES.length];
            return (
              <article key={item.slug} className="group flex flex-col items-center">
                <Link
                  href={`/autor/${item.slug}`}
                  className={cn(
                    "relative z-10 -mb-12 size-28 overflow-hidden rounded-full ring-4 ring-white shadow-md sm:size-32",
                    "transition duration-300 group-hover:ring-[var(--cartel-blue)]/25",
                    theme.avatar,
                  )}
                >
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.name}
                      fill
                      sizes="128px"
                      className="object-cover object-[center_18%] grayscale transition-[filter,transform] duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0"
                      unoptimized={item.avatarUrl.startsWith("/")}
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center font-heading text-2xl font-black text-white">
                      {initials(item.name)}
                    </span>
                  )}
                </Link>

                <div
                  className={cn(
                    "flex w-full min-w-0 flex-1 flex-col items-center rounded-2xl px-4 pb-6 pt-16 text-center",
                    theme.card,
                  )}
                >
                  <Link
                    href={`/autor/${item.slug}`}
                    className="text-base font-semibold tracking-tight text-foreground transition hover:text-[var(--cartel-blue)]"
                  >
                    {item.name}
                  </Link>

                  {item.latestArticle ? (
                    <Link
                      href={`/noticia/${item.latestArticle.slug}`}
                      title={item.latestArticle.title}
                      className="mt-2 flex min-h-[2.375rem] w-full min-w-0 flex-col items-center"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--cartel-blue)]">
                        Última nota
                      </span>
                      <span className="mt-0.5 flex h-5 w-full min-w-0 items-center justify-center gap-1 text-sm font-medium text-[var(--cartel-blue)] underline-offset-2 hover:underline">
                        <span className="min-w-0 truncate">{item.latestArticle.title}</span>
                        <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
                      </span>
                    </Link>
                  ) : (
                    <p className="mt-2 flex min-h-[2.375rem] w-full min-w-0 items-end justify-center truncate text-sm leading-5 text-muted-foreground">
                      {item.column}
                    </p>
                  )}

                  {item.socials && (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      {SOCIAL_ITEMS.map(({ key, label, Icon }) => {
                        const href = item.socials?.[key];
                        if (!href) return null;
                        return (
                          <a
                            key={key}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${item.name} en ${label}`}
                            title={label}
                            className="text-foreground/80 transition hover:text-[var(--cartel-blue)]"
                          >
                            <Icon className="size-5" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
