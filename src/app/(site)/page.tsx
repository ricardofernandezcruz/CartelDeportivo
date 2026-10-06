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

export const revalidate = 60;

export default async function HomePage() {
  const [
    carouselSlides,
    ticker,
    destacadas,
    mostViewed,
    stories,
    beisbol,
    futbol,
    baloncesto,
    latest,
    lidom,
    columnists,
  ] = await Promise.all([
    getFeaturedArticles(6),
    getPublishedArticles(10),
    getPublishedArticles(6),
    getMostViewed(5),
    getStoryArticles(8),
    getArticlesByCategory("beisbol", 4),
    getArticlesByCategory("futbol", 4),
    getArticlesByCategory("baloncesto", 3),
    getPublishedArticles(5),
    getLidomStandings(),
    getColumnists(),
  ]);

  const [featPrimary, featSecondary, ...featRest] = destacadas;
  const masDeporte = [...baloncesto, ...beisbol.slice(0, 1)].slice(0, 4);

  return (
    <>
      <BreakingTicker items={ticker} />
      <HeroCarousel
        slides={(carouselSlides.length ? carouselSlides : ticker.slice(0, 6)).map((a) => ({
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

            <AdSlot label="Publicidad" />

            <div>
              <SectionTitle title="Beísbol" href="/categoria/beisbol" />
              <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card/50 px-2">
                {beisbol.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="list" />
                ))}
              </div>
            </div>

            <AdSlot label="Banreservas · Demo" />

            <div>
              <SectionTitle title="Fútbol" href="/categoria/futbol" />
              <div className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card/50 px-2">
                {futbol.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="list" />
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <LidomStandings data={lidom} />

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <SectionTitle title="Más vistas de la semana" className="mb-3" />
              {mostViewed.map((a) => (
                <ArticleCard key={a.id} article={a} variant="ranked" />
              ))}
            </div>

            <AdSlot />

            <StoriesRail items={stories} title="En foco" />

            <div className="rounded-xl border border-dashed border-[var(--cartel-blue)]/40 bg-[var(--cartel-blue)]/5 p-6 text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--cartel-blue)]">PANAM</p>
              <p className="mt-2 text-sm text-muted-foreground">Espacio patrocinador · como en el sitio en vivo</p>
            </div>
          </aside>
        </section>
      </div>

      <CartelTvSection />

      <OpinionsSection items={columnists} />

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <section className="mt-4">
          <SectionTitle title="Más deporte" href="/categoria/baloncesto" />
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
