"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnistAvatar } from "@/components/site/columnist-avatar";
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

type OpinionsStyle = "actual" | "inicial";

const STORAGE_KEY = "cartel-opiniones-style";

const SOCIAL_ITEMS = [
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "x", label: "X", Icon: XIcon },
  { key: "tiktok", label: "TikTok", Icon: TikTokIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
] as const;

function SocialRow({
  item,
  className,
  iconClassName,
}: {
  item: ColumnistCardItem;
  className?: string;
  iconClassName?: string;
}) {
  const links = SOCIAL_ITEMS.map(({ key, label, Icon }) => {
    const href = item.socials?.[key];
    if (!href) return null;
    return { key, label, Icon, href };
  }).filter((v): v is NonNullable<typeof v> => Boolean(v));

  if (!links.length) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {links.map(({ key, label, Icon, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`${item.name} en ${label}`}
          title={label}
          className={iconClassName}
        >
          <Icon className="size-5" />
        </a>
      ))}
    </div>
  );
}

const CARD_THEMES = [
  { card: "bg-[#dbeafe]", avatar: "bg-[#93c5fd]" },
  { card: "bg-[#e8eaee]", avatar: "bg-[#c5c9d1]" },
  { card: "bg-[#d1fae5]", avatar: "bg-[#86efac]" },
  { card: "bg-[#fce7f3]", avatar: "bg-[#f9a8d4]" },
] as const;

function StyleToggle({
  value,
  onChange,
  inverted,
}: {
  value: OpinionsStyle;
  onChange: (next: OpinionsStyle) => void;
  inverted?: boolean;
}) {
  return (
    <div className="mb-8 flex justify-center sm:mb-10">
      <div
        className={cn(
          "inline-flex flex-wrap items-center justify-center gap-1 rounded-full p-1 text-xs font-semibold",
          inverted ? "bg-white/15 text-white" : "border border-border bg-white/80 text-foreground shadow-sm",
        )}
      >
        <span className={cn("px-2.5 py-1 tracking-wide", inverted ? "text-white/70" : "text-muted-foreground")}>
          Vista de muestra
        </span>
        {(
          [
            { id: "actual", label: "Estilo actual" },
            { id: "inicial", label: "Estilo inicial" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={value === opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-full px-3 py-1.5 transition",
              value === opt.id
                ? inverted
                  ? "bg-white text-[var(--cartel-blue)] shadow-sm"
                  : "bg-[var(--cartel-blue)] text-white shadow-sm"
                : inverted
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LatestNoteLink({
  item,
  tone,
  align = "center",
}: {
  item: ColumnistCardItem;
  tone: "light" | "onBlue";
  align?: "center" | "start";
}) {
  const labelClass =
    tone === "onBlue" ? "text-white/70" : "text-[var(--cartel-blue)]";
  const titleClass =
    tone === "onBlue" ? "text-white" : "text-[var(--cartel-blue)]";
  const start = align === "start";

  if (item.latestArticle) {
    return (
      <Link
        href={`/noticia/${item.latestArticle.slug}`}
        title={item.latestArticle.title}
        className={cn(
          "mt-2 flex min-h-[2.375rem] w-full min-w-0 flex-col",
          start ? "items-start" : "items-center",
        )}
      >
        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", labelClass)}>
          Última nota
        </span>
        <span
          className={cn(
            "mt-0.5 flex h-5 w-full min-w-0 items-center gap-1 text-sm font-medium underline-offset-2 hover:underline",
            start ? "justify-start text-left" : "justify-center",
            titleClass,
          )}
        >
          <span className="min-w-0 truncate">{item.latestArticle.title}</span>
          <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
        </span>
      </Link>
    );
  }

  if (tone === "onBlue") {
    return (
      <Link
        href={`/autor/${item.slug}`}
        className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white"
      >
        Ver perfil
      </Link>
    );
  }

  return (
    <Link
      href={`/autor/${item.slug}`}
      className={cn(
        "mt-2 flex min-h-[2.375rem] w-full min-w-0 flex-col",
        start ? "items-start" : "items-center",
      )}
    >
      <span className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", labelClass)}>
        Columna
      </span>
      <span
        className={cn(
          "mt-0.5 flex h-5 w-full min-w-0 items-center gap-1 text-sm font-medium underline-offset-2 hover:underline",
          start ? "justify-start text-left" : "justify-center",
          titleClass,
        )}
      >
        <span className="min-w-0 truncate">{item.column}</span>
        <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
      </span>
    </Link>
  );
}

function OpinionsCurrent({
  items,
  style,
  onStyleChange,
}: {
  items: ColumnistCardItem[];
  style?: OpinionsStyle;
  onStyleChange?: (next: OpinionsStyle) => void;
}) {
  return (
    <section className="relative isolate border-y border-[var(--cartel-blue)]/15 bg-[#e8f1fb]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        {style && onStyleChange ? <StyleToggle value={style} onChange={onStyleChange} /> : null}
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
                  aria-label={item.name}
                  className={cn(
                    "relative z-10 -mb-12 size-28 overflow-hidden rounded-full ring-4 ring-white shadow-md sm:size-32",
                    "transition duration-300 group-hover:ring-[var(--cartel-blue)]/25",
                    theme.avatar,
                  )}
                >
                  <ColumnistAvatar
                    src={item.avatarUrl}
                    name={item.name}
                    slug={item.slug}
                    priority={i < 4}
                    className="grayscale transition-[filter,transform] duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0"
                  />
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

                  <LatestNoteLink item={item} tone="light" />

                  <SocialRow
                    item={item}
                    className="mt-4 justify-center"
                    iconClassName="text-foreground/80 transition hover:text-[var(--cartel-blue)]"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OpinionsClassic({
  items,
  style,
  onStyleChange,
}: {
  items: ColumnistCardItem[];
  style?: OpinionsStyle;
  onStyleChange?: (next: OpinionsStyle) => void;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[var(--cartel-blue)] via-[#0a63b8] to-[#084a8a]">
      <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-[var(--cartel-red)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        {style && onStyleChange ? <StyleToggle value={style} onChange={onStyleChange} inverted /> : null}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center font-heading text-3xl font-black uppercase tracking-tight text-white sm:mb-12 sm:text-4xl"
        >
          Opiniones
        </motion.h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {items.map((item, i) => (
            <motion.article
              key={item.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className={cn(
                "group flex min-w-0 items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm",
                "transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 hover:shadow-lg hover:shadow-black/10",
              )}
            >
              <Link
                href={`/autor/${item.slug}`}
                aria-label={item.name}
                className="relative size-14 shrink-0 overflow-hidden rounded-full bg-white/15 ring-2 ring-white/40 sm:size-16"
              >
                <ColumnistAvatar
                  src={item.avatarUrl}
                  name={item.name}
                  slug={item.slug}
                  sizes="64px"
                  priority={i < 4}
                  className="grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0"
                />
              </Link>

              <div className="min-w-0 flex-1 pt-0.5 text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                  {item.column}
                </p>
                <h3 className="mt-1 font-heading text-sm font-black uppercase leading-snug tracking-tight text-white sm:text-[15px]">
                  <Link href={`/autor/${item.slug}`} className="hover:underline">
                    {item.name}
                  </Link>
                </h3>
                <LatestNoteLink item={item} tone="onBlue" align="start" />
                <SocialRow
                  item={item}
                  className="mt-2"
                  iconClassName="text-white/80 transition hover:text-white"
                />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OpinionsSection({ items }: { items: ColumnistCardItem[] }) {
  const [style, setStyle] = useState<OpinionsStyle>("actual");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "actual" || saved === "inicial") setStyle(saved);
  }, []);

  function select(next: OpinionsStyle) {
    setStyle(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  if (!items.length) return null;

  if (style === "inicial") {
    return <OpinionsClassic items={items} style={style} onStyleChange={select} />;
  }

  return <OpinionsCurrent items={items} style={style} onStyleChange={select} />;
}
