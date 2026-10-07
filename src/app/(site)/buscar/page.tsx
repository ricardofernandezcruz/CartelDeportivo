import Link from "next/link";
import { SearchForm } from "@/components/site/search-form";
import { ArticleCard } from "@/components/site/article-card";
import { searchArticles } from "@/lib/search";

export const revalidate = 30;

type PageProps = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchArticles(query) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <h1 className="font-heading text-4xl font-black uppercase tracking-tight">Buscar</h1>
      <p className="mt-2 text-muted-foreground">Equipos, ligas, jugadores y titulares.</p>
      <div className="mt-6">
        <SearchForm initialQuery={query} />
      </div>

      {query && (
        <p className="mt-6 text-sm text-muted-foreground">
          {results.length} resultado{results.length === 1 ? "" : "s"} para{" "}
          <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      <div className="mt-6 space-y-3">
        {results.map((hit) => (
          <Link
            key={hit.id}
            href={`/noticia/${hit.slug}`}
            className="block rounded-xl border border-border p-4 transition hover:border-primary/40 hover:bg-muted/40"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-primary">{hit.categoryName}</p>
            <p className="font-heading text-xl font-black uppercase leading-tight">{hit.title}</p>
            {hit.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{hit.excerpt}</p>}
          </Link>
        ))}
      </div>

      {!query && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <ArticleCard
            article={{
              slug: "demo",
              title: "Escribe arriba para probar la búsqueda",
              excerpt: "Prueba términos como Águilas, MLB, Cibao FC o LIDOM.",
              category: { name: "Ayuda", slug: "ayuda" },
              author: { name: "Redacción" },
            }}
          />
        </div>
      )}
    </div>
  );
}
