import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/site/article-card";
import { getArticlesByTag, getTagBySlug } from "@/lib/articles";
import type { Metadata } from "next";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug).catch(() => null);
  return {
    title: tag ? `#${tag.name}` : "Etiqueta",
    description: tag ? `Noticias de ${tag.name} en Cartel Deportivo` : undefined,
    alternates: { canonical: `/etiqueta/${slug}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();
  const articles = await getArticlesByTag(slug, 36);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Etiqueta</p>
        <h1 className="font-heading text-4xl font-black uppercase tracking-tight">#{tag.name}</h1>
      </header>
      {articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Aún no hay noticias con esta etiqueta.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
