import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/site/article-card";
import { getAuthorBySlug } from "@/lib/columnists";
import { getPublishedArticlesByAuthor } from "@/lib/articles";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Notas" };
  return { title: `Notas de ${author.name}` };
}

export default async function AuthorArticlesPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const articles = await getPublishedArticlesByAuthor(author.slug).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <nav className="mb-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Link href="/" className="hover:text-[var(--cartel-red)]">
          Inicio
        </Link>
        <span className="px-2">/</span>
        <Link href={`/autor/${author.slug}`} className="hover:text-[var(--cartel-red)]">
          {author.name}
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Notas</span>
      </nav>

      <header className="mb-8 border-b border-border pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--cartel-red)]">
          {author.column}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Todas las notas de {author.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {articles.length} {articles.length === 1 ? "publicación" : "publicaciones"}
        </p>
      </header>

      {articles.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          Todavía no hay notas publicadas de {author.name}.
        </p>
      )}
    </div>
  );
}
