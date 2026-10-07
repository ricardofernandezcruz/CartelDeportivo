import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/site/article-card";
import { getAuthorBySlug } from "@/lib/columnists";
import { getPublishedArticlesByAuthor } from "@/lib/articles";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Autor" };
  return {
    title: author.name,
    description: author.bio ?? `Columnas y noticias de ${author.name} en Cartel Deportivo.`,
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  let latest: Awaited<ReturnType<typeof getPublishedArticlesByAuthor>> = [];
  try {
    latest = await getPublishedArticlesByAuthor(author.slug, 4);
  } catch {
    latest = [];
  }
  const hasMore = latest.length > 3;
  const preview = latest.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6 lg:py-14">
      <nav className="mb-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Link href="/" className="hover:text-[var(--cartel-red)]">
          Inicio
        </Link>
        <span className="px-2">/</span>
        <span>Opiniones</span>
        <span className="px-2">/</span>
        <span className="text-foreground">{author.name}</span>
      </nav>

      <header className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-muted/20 px-6 py-10 text-center sm:flex-row sm:items-start sm:text-left sm:px-10">
        <span className="relative size-36 shrink-0 overflow-hidden rounded-full bg-white ring-4 ring-[var(--cartel-blue)]/20 sm:size-40">
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={author.name}
              fill
              sizes="160px"
              className="object-cover object-center"
              unoptimized={author.avatarUrl.startsWith("/")}
              priority
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-[var(--cartel-blue)] font-heading text-4xl font-black text-white">
              {author.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--cartel-red)]">
            {author.column}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
            {author.name}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{author.role}</p>
          {author.bio && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mx-0">
              {author.bio}
            </p>
          )}
        </div>
      </header>

      <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-2xl font-black uppercase tracking-tight">Últimas notas</h2>
          <Link
            href={`/autor/${author.slug}/noticias`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cartel-blue)] hover:text-[var(--cartel-red)]"
          >
            Ver todas
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {preview.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <Link
                  href={`/autor/${author.slug}/noticias`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--cartel-blue)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--cartel-red)]"
                >
                  Ver todas las notas
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
            Todavía no hay notas publicadas de {author.name}.
          </p>
        )}
      </section>
    </div>
  );
}
