import Link from "next/link";
import { AdSlot } from "@/components/site/ad-slot";
import { ArticleCard } from "@/components/site/article-card";
import { BreakingTicker } from "@/components/site/breaking-ticker";
import { CartelTvSection } from "@/components/site/cartel-tv";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { NewsletterBlock } from "@/components/site/newsletter-block";
import { OpinionsSection } from "@/components/site/opinions-section";
import { SectionTitle } from "@/components/site/section-title";
import { SponsorBanner } from "@/components/site/sponsor-banner";
import { LidomStandings } from "@/components/site/lidom-standings";
import { StoriesRail } from "@/components/site/stories-rail";
import {
  getArticlesByCategory,
  getFeaturedArticles,
  getMostViewed,
  getPublishedArticles,
  getStoryArticles,
} from "@/lib/articles";
import { getColumnists } from "@/lib/columnists";
import { getLidomStandings } from "@/lib/fetch-lidom-standings";
import { takeUnused } from "@/lib/home-feed";

export const revalidate = 60;

export default async function HomePage() {
  const [
    featuredPool,
    publishedPool,
    mostViewedPool,
    storiesPool,
    beisbolPool,
    futbolPool,
    baloncestoPool,
    boxeoPool,
    motorPool,
    lidom,
    columnists,
  ] = await Promise.all([
    getFeaturedArticles(12),
    getPublishedArticles(36),
    getMostViewed(8),
    getStoryArticles(16),
    getArticlesByCategory("beisbol", 12),
    getArticlesByCategory("futbol", 12),
    getArticlesByCategory("baloncesto", 12),
    getArticlesByCategory("boxeo", 8),
    getArticlesByCategory("motor", 8),
    getLidomStandings(),
    getColumnists(),
  ]);

  const used = new Set<string>();
  const ticker = publishedPool.slice(0, 10);
  const heroSource = featuredPool.length ? featuredPool : publishedPool;
  const carouselSlides = takeUnused(used, heroSource, 6);
  const destacadas = takeUnused(used, publishedPool, 4);
  const beisbol = takeUnused(used, beisbolPool, 4);
  const futbol = takeUnused(used, futbolPool, 4);
  const boxeo = takeUnused(used, boxeoPool, 4);
  const motor = takeUnused(used, motorPool, 4);
  const storiesUnique = takeUnused(used, storiesPool, 8);
  const stories = storiesUnique.length >= 3 ? storiesUnique : storiesPool.slice(0, 8);
  const masDeporte = takeUnused(used, [...baloncestoPool, ...boxeoPool, ...motorPool], 4);
  const latest = takeUnused(used, publishedPool, 5);
  const mostViewed = mostViewedPool.slice(0, 5);

  const [featPrimary, featSecondary, ...featRest] = destacadas;

  return (
    <>
      <BreakingTicker items={ticker} />
      <HeroCarousel
        slides={carouselSlides.map((a) => ({
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          heroImageUrl: a.heroImageUrl,
          publishedAt: a.publishedAt,
          category: { name: a.category.name, slug: a.category.slug, color: a.category.color },
          author: { name: a.author.name },
        }))}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <SponsorBanner />

        <section className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <div>
              <SectionTitle title="Destacadas" />
              <div className="space-y-8 divide-y divide-border/60">
                {featPrimary && <ArticleCard article={featPrimary} variant="featured" />}
                {featSecondary && <ArticleCard article={featSecondary} variant="featured" />}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featRest.slice(0, 2).map((a) => (
                <ArticleCard key={a.id} article={a} variant="compact" />
              ))}
            </div>

            <AdSlot label="Publicidad" slot="home" />

            <div>
              <SectionTitle title="Beísbol" href="/categoria/beisbol" />
              <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card/50 px-2">
                {beisbol.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="list" />
                ))}
              </div>
            </div>

            <AdSlot slot="sidebar" />

            <div>
              <SectionTitle title="Fútbol" href="/categoria/futbol" />
              <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card/50 px-2">
                {futbol.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="list" />
                ))}
              </div>
            </div>

            {boxeo.length > 0 && (
              <div>
                <SectionTitle title="Boxeo" href="/categoria/boxeo" />
                <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card/50 px-2">
                  {boxeo.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="list" />
                  ))}
                </div>
              </div>
            )}

            {motor.length > 0 && (
              <div>
                <SectionTitle title="Motor" href="/categoria/motor" />
                <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card/50 px-2">
                  {motor.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="list" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <LidomStandings data={lidom} />

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <SectionTitle title="Más vistas de la semana" className="mb-3" />
              {mostViewed.map((a) => (
                <ArticleCard key={a.id} article={a} variant="ranked" />
              ))}
            </div>

            <AdSlot slot="sidebar" />

            <StoriesRail items={stories} title="En foco" />

            <AdSlot label="Publicidad" slot="home" />
          </aside>
        </section>
      </div>

      <CartelTvSection />

      <OpinionsSection items={columnists} />

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <section className="mt-4">
          <SectionTitle title="Más deporte" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {masDeporte.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <NewsletterBlock />
          <div className="rounded-xl border border-border p-6">
            <h3 className="font-heading text-lg font-black uppercase">Más noticias</h3>
            <ul className="mt-4 space-y-3">
              {latest.map((a) => (
                <li key={a.id}>
                  <Link href={`/noticia/${a.slug}`} className="text-sm font-semibold hover:text-[var(--cartel-red)]">
                    {a.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{a.category.name}</p>
                </li>
              ))}
            </ul>
            <Link href="/admin/login" className="mt-4 inline-block text-xs font-bold uppercase text-[var(--cartel-blue)] hover:underline">
              Acceso redacción
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
