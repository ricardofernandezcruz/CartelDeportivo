import { notFound } from "next/navigation";
import { ArticleCard, type ArticleCardData } from "@/components/site/article-card";
import { AdSlot } from "@/components/site/ad-slot";
import { FootballLeaguesBoard } from "@/components/site/football-leagues-board";
import { getArticlesByCategory, getAllCategories } from "@/lib/articles";
import { getAllFootballStandings } from "@/lib/fetch-football-standings";
import {
  FOOTBALL_LEAGUES,
  groupArticlesByLeague,
  type FootballLeagueId,
} from "@/lib/football-leagues";
import type { Metadata } from "next";

export const revalidate = 60;

type CategoryArticle = Awaited<ReturnType<typeof getArticlesByCategory>>[number];

function toCardData(article: CategoryArticle): ArticleCardData {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    heroImageUrl: article.heroImageUrl,
    publishedAt: article.publishedAt,
    viewCount: article.viewCount,
    category: {
      name: article.category.name,
      slug: article.category.slug,
      color: article.category.color ?? undefined,
    },
    author: { name: article.author.name },
    featured: article.featured,
  };
}

async function buildFootballBoard(articles: CategoryArticle[]) {
  const standings = await getAllFootballStandings();
  const grouped = groupArticlesByLeague(articles);

  const news = Object.fromEntries(
    Object.entries(grouped).map(([leagueId, list]) => [leagueId, list.slice(0, 6).map(toCardData)]),
  ) as Record<FootballLeagueId, ArticleCardData[]>;

  const leagueSlugs = new Set(
    Object.values(grouped).flatMap((list) => list.map((a) => a.slug)),
  );

  return { standings, news, leagueSlugs };
}

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ liga?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug);
  return { title: category?.name ?? "Categoría" };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const isFootball = slug === "futbol";
  const initialLeague = FOOTBALL_LEAGUES.some((l) => l.id === query.liga)
    ? (query.liga as FootballLeagueId)
    : "premier";
  const articles = await getArticlesByCategory(slug, isFootball ? 60 : 24);
  const board = isFootball ? await buildFootballBoard(articles) : null;

  // En fútbol, las notas de ligas europeas van dentro del board; el resto abajo.
  const restArticles = board
    ? articles.filter((a) => !board.leagueSlugs.has(a.slug)).slice(0, 24)
    : articles;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Sección</p>
        <h1 className="font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">{category.name}</h1>
        {isFootball ? (
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Premier League, La Liga, Serie A y Ligue 1 con tabla en vivo y noticias de cada campeonato.
          </p>
        ) : category.description ? (
          <p className="mt-3 max-w-2xl text-muted-foreground">{category.description}</p>
        ) : null}
      </header>

      <div className="mb-8">
        <AdSlot label={`Publicidad · ${category.name}`} />
      </div>

      {board && (
        <div className="mb-12">
          <FootballLeaguesBoard
            standings={board.standings}
            news={board.news}
            initialLeague={initialLeague}
          />
        </div>
      )}

      {board && restArticles.length > 0 && (
        <h2 className="mb-4 border-b-2 border-[var(--cartel-blue)] pb-2 font-heading text-xl font-black uppercase tracking-tight sm:text-2xl">
          Más fútbol
        </h2>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {restArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && !board && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Aún no hay noticias publicadas en esta sección.
        </p>
      )}
    </div>
  );
}
