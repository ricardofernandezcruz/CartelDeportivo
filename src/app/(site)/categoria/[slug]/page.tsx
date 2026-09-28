import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/site/article-card";
import { AdSlot } from "@/components/site/ad-slot";
import { getArticlesByCategory, getAllCategories } from "@/lib/articles";
import type { Metadata } from "next";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug);
  return { title: category?.name ?? "Categoría" };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const articles = await getArticlesByCategory(slug, 24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Sección</p>
        <h1 className="font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">{category.name}</h1>
        {category.description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{category.description}</p>
        )}
      </header>

      <div className="mb-8">
        <AdSlot label={`Publicidad · ${category.name}`} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Aún no hay noticias publicadas en esta sección.
        </p>
      )}
    </div>
  );
}
