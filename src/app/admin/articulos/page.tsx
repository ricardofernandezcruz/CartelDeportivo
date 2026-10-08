import Link from "next/link";
import { SiteImage } from "@/components/site/site-image";
import { CalendarClock, Plus } from "lucide-react";
import { getAdminArticles } from "@/lib/articles";
import { publishDueArticles } from "@/lib/publish-scheduled";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, formatSchedule } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArticlesFlash, type ArticlesFlashKind } from "@/components/admin/articles-flash";
import type { ArticleStatus } from "@prisma/client";

const statusLabel: Record<string, string> = {
  PUBLISHED: "Publicada",
  DRAFT: "Borrador",
  REVIEW: "Revisión",
  SCHEDULED: "Programada",
};

const filters: { key: string; label: string; status?: ArticleStatus }[] = [
  { key: "all", label: "Todas" },
  { key: "PUBLISHED", label: "Publicadas", status: "PUBLISHED" },
  { key: "SCHEDULED", label: "Programadas", status: "SCHEDULED" },
  { key: "DRAFT", label: "Borradores", status: "DRAFT" },
  { key: "REVIEW", label: "Revisión", status: "REVIEW" },
];

const FLASH_VALUES = ["publicada", "programada"] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFlash(value: string | string[] | undefined): ArticlesFlashKind | null {
  const raw = firstParam(value);
  return FLASH_VALUES.includes(raw as ArticlesFlashKind) ? (raw as ArticlesFlashKind) : null;
}

type PageProps = {
  searchParams: Promise<{ estado?: string; hecho?: string | string[]; slug?: string | string[]; cuando?: string | string[] }>;
};

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  await publishDueArticles().catch(() => null);

  const { estado, hecho, slug, cuando } = await searchParams;
  const active = filters.find((f) => f.key === estado) ?? filters[0];
  const articles = await getAdminArticles(active.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contenido</p>
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight">Noticias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length} piezas · programa o publica con un clic
          </p>
        </div>
        <Link
          href="/admin/articulos/nuevo"
          className={cn(buttonVariants(), "bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90")}
        >
          <Plus className="h-4 w-4" />
          Nueva noticia
        </Link>
      </div>

      <ArticlesFlash
        hecho={parseFlash(hecho)}
        slug={firstParam(slug) ?? null}
        scheduledFor={firstParam(cuando) ?? null}
        estado={active.key === "all" ? null : active.key}
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = f.key === active.key;
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/articulos" : `/admin/articulos?estado=${f.key}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
                isActive
                  ? "border-[var(--cartel-blue)] bg-[var(--cartel-blue)] text-white"
                  : "border-border bg-white text-muted-foreground hover:border-[var(--cartel-blue)]/40 hover:text-[var(--cartel-blue)] dark:bg-card",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/admin/articulos/${article.id}`}
            className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--cartel-red)]/30 hover:shadow-md dark:bg-card sm:p-4"
          >
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-36">
              {article.heroImageUrl ? (
                <SiteImage
                  src={article.heroImageUrl}
                  alt=""
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="144px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sin foto</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-[var(--cartel-blue)]/30 text-[var(--cartel-blue)]"
                >
                  {article.category.name}
                </Badge>
                <Badge
                  variant={article.status === "PUBLISHED" ? "default" : "secondary"}
                  className={cn(
                    article.status === "PUBLISHED" && "bg-[var(--cartel-red)]",
                    article.status === "SCHEDULED" && "bg-violet-600 text-white hover:bg-violet-600",
                  )}
                >
                  {statusLabel[article.status] ?? article.status}
                </Badge>
                {article.featured && (
                  <Badge variant="outline" className="border-amber-400 text-amber-700">
                    Portada
                  </Badge>
                )}
              </div>
              <h2 className="mt-1.5 line-clamp-2 font-heading text-lg font-black uppercase leading-tight tracking-tight group-hover:text-[var(--cartel-red)]">
                {article.title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {article.author.name} · {formatRelativeDate(article.updatedAt)}
                {article.viewCount > 0 && ` · ${article.viewCount} vistas`}
              </p>
              {article.status === "SCHEDULED" && article.scheduledFor && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--cartel-blue)]">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Sale {formatSchedule(article.scheduledFor)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-semibold">No hay noticias en este filtro</p>
          <p className="mt-1 text-sm text-muted-foreground">Cambia el filtro o crea una nueva.</p>
        </div>
      )}
    </div>
  );
}
