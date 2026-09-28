import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/format";

export type ArticleCardData = {
  slug: string;
  title: string;
  excerpt?: string | null;
  heroImageUrl?: string | null;
  publishedAt?: Date | null;
  viewCount?: number;
  category: { name: string; slug: string; color?: string };
  author: { name: string };
  featured?: boolean;
};

export function ArticleCard({
  article,
  variant = "default",
}: {
  article: ArticleCardData;
  variant?: "default" | "compact" | "hero" | "featured" | "list" | "ranked" | "opinion";
}) {
  const href = `/noticia/${article.slug}`;

  if (variant === "hero") {
    return (
      <Link href={href} className="group relative block overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60">
        <div className="relative aspect-[16/9] min-h-[280px] w-full sm:aspect-[21/9]">
          {article.heroImageUrl ? (
            <Image
              src={article.heroImageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <Badge className="mb-3 bg-primary text-primary-foreground">{article.category.name}</Badge>
            <h2 className="font-heading text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl lg:text-5xl">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="mt-3 line-clamp-2 max-w-3xl text-sm text-white/85 sm:text-base">{article.excerpt}</p>
            )}
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/70">
              {article.author.name} · {formatRelativeDate(article.publishedAt)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={href} className="group grid gap-4 sm:grid-cols-[1fr_200px] sm:items-start">
        <div>
          <h3 className="font-heading text-2xl font-black uppercase leading-tight tracking-tight group-hover:text-[var(--cartel-red)] sm:text-3xl">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Por{" "}
            <span className="font-semibold text-foreground">{article.author.name}</span> ·{" "}
            {formatRelativeDate(article.publishedAt)}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted sm:aspect-square">
          {article.heroImageUrl && (
            <Image src={article.heroImageUrl} alt="" fill className="object-cover transition group-hover:scale-105" sizes="200px" />
          )}
        </div>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <Link href={href} className="group flex gap-4 border-b border-border/70 py-4 last:border-0">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-32">
          {article.heroImageUrl && (
            <Image src={article.heroImageUrl} alt="" fill className="object-cover" sizes="128px" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-black uppercase leading-tight group-hover:text-[var(--cartel-red)]">
            {article.title}
          </h3>
          {article.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>}
          <p className="mt-2 text-xs text-muted-foreground">Por {article.author.name}</p>
        </div>
      </Link>
    );
  }

  if (variant === "ranked") {
    return (
      <Link href={href} className="group flex items-start gap-3 py-3">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-muted">
          {article.heroImageUrl && (
            <Image src={article.heroImageUrl} alt="" fill className="object-cover" sizes="80px" />
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-[var(--cartel-red)]">{article.title}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatRelativeDate(article.publishedAt)}
            {typeof article.viewCount === "number" && (
              <span className="ml-2 font-semibold text-[var(--cartel-blue)]">{article.viewCount} views</span>
            )}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "opinion") {
    return (
      <Link href={href} className="group block rounded-lg border border-border/70 p-4 transition hover:border-[var(--cartel-blue)]/40 hover:bg-muted/30">
        <Badge variant="outline" className="mb-2 border-[var(--cartel-blue)] text-[var(--cartel-blue)]">
          {article.category.name}
        </Badge>
        <h3 className="font-heading text-base font-black uppercase leading-snug group-hover:text-[var(--cartel-red)]">
          {article.title}
        </h3>
        <p className="mt-2 text-xs text-muted-foreground">{formatRelativeDate(article.publishedAt)}</p>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
          {article.heroImageUrl && (
            <Image src={article.heroImageUrl} alt="" fill className="object-cover" sizes="96px" />
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">{article.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatRelativeDate(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/10] bg-muted">
        {article.heroImageUrl && (
          <Image src={article.heroImageUrl} alt="" fill className="object-cover transition group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 400px" />
        )}
        <Badge className="absolute left-3 top-3" style={{ backgroundColor: article.category.color }}>
          {article.category.name}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-xl font-black uppercase leading-tight tracking-tight group-hover:text-primary">
          {article.title}
        </h3>
        {article.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>}
        <p className="mt-auto pt-4 text-xs text-muted-foreground">
          Por {article.author.name} · {formatRelativeDate(article.publishedAt)}
        </p>
      </div>
    </Link>
  );
}
