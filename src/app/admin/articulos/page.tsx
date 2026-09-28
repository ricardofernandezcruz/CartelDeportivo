import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getAdminArticles } from "@/lib/articles";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  PUBLISHED: "Publicada",
  DRAFT: "Borrador",
  REVIEW: "Revisión",
  SCHEDULED: "Programada",
};

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contenido</p>
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight">Noticias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length} piezas · haz clic para editar
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

      <div className="grid gap-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/admin/articulos/${article.id}`}
            className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--cartel-red)]/30 hover:shadow-md dark:bg-card sm:p-4"
          >
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-36">
              {article.heroImageUrl ? (
                <Image
                  src={article.heroImageUrl}
                  alt=""
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="144px"
                  unoptimized={article.heroImageUrl.startsWith("/")}
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
                  className={cn(article.status === "PUBLISHED" && "bg-[var(--cartel-red)]")}
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
            </div>
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-semibold">Aún no hay noticias</p>
          <p className="mt-1 text-sm text-muted-foreground">Crea la primera desde el botón de arriba.</p>
        </div>
      )}
    </div>
  );
}
