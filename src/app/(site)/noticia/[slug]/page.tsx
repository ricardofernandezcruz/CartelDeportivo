import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/site/ad-slot";
import { ArticleBody } from "@/components/site/article-body";
import { ArticleCard } from "@/components/site/article-card";
import { AuthorByline, AuthorCard } from "@/components/site/author-card";
import { ShareActions } from "@/components/site/share-actions";
import { formatArticleDate, readingTimeMinutes } from "@/lib/format";
import { isCrawler } from "@/lib/bots";
import { publicImageUrl, publicYoutubeId } from "@/lib/media";
import { ArticleComments } from "@/components/site/article-comments";
import { JsonLd } from "@/components/site/json-ld";
import { SiteImage } from "@/components/site/site-image";
import { getApprovedComments, getArticleBySlug, getRelatedArticles, incrementViewCount } from "@/lib/articles";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";

export const revalidate = 120;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Noticia no encontrada", robots: { index: false } };
  const description = article.seoDescription ?? article.excerpt ?? undefined;
  return {
    title: article.seoTitle ?? article.title,
    description,
    alternates: { canonical: `/noticia/${article.slug}` },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author.name],
      locale: "es_DO",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const ua = (await headers()).get("user-agent");
  if (!isCrawler(ua)) {
    await incrementViewCount(article.id);
  }

  const [related, comments] = await Promise.all([
    getRelatedArticles(article, 6),
    getApprovedComments(article.id),
  ]);
  const relatedFiltered = related.filter((a) => a.id !== article.id).slice(0, 6);
  const dateLabel = formatArticleDate(article.publishedAt);
  const updatedLabel =
    article.publishedAt && article.updatedAt.getTime() - article.publishedAt.getTime() > 2 * 60_000
      ? formatArticleDate(article.updatedAt)
      : null;
  const minutes = readingTimeMinutes(article.contentHtml);
  const cover = publicImageUrl(article.heroImageUrl);
  const videoId = publicYoutubeId(article.youtubeId);
  const author = {
    name: article.author.name,
    slug: article.author.slug,
    bio: article.author.bio,
    avatarUrl: article.author.avatarUrl,
  };
  const alsoRead = relatedFiltered[0]
    ? { slug: relatedFiltered[0].slug, title: relatedFiltered[0].title }
    : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: cover ? [cover.startsWith("http") ? cover : absoluteUrl(cover)] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Person", name: article.author.name },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo.png") },
    },
    mainEntityOfPage: absoluteUrl(`/noticia/${article.slug}`),
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <JsonLd data={jsonLd} />
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Link href="/" className="hover:text-[var(--cartel-red)]">
          Inicio
        </Link>
        <span>/</span>
        <Link href={`/categoria/${article.category.slug}`} className="hover:text-[var(--cartel-red)]">
          {article.category.name}
        </Link>
      </nav>

      <Badge
        className="mb-4 border-0 text-white"
        style={{ backgroundColor: article.category.color ?? "var(--cartel-red)" }}
      >
        {article.category.name}
      </Badge>

      <h1 className="font-heading text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-[3.25rem]">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">{article.excerpt}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <div>
          <AuthorByline author={author} dateLabel={dateLabel} />
          <p className="mt-1 text-xs text-muted-foreground">
            {minutes} min de lectura
            {updatedLabel ? ` · Actualizada el ${updatedLabel}` : null}
          </p>
        </div>
        <ShareActions title={article.title} slug={article.slug} />
      </div>

      {cover && (
        <figure className="mt-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-sm">
            <SiteImage
              src={cover}
              alt={article.heroAlt || article.heroCaption || article.title}
              fill
              className="object-cover"
              style={{ objectPosition: `${article.heroFocalX}% ${article.heroFocalY}%` }}
              priority
              sizes="(max-width:768px) 100vw, 900px"
            />
          </div>
          {(article.heroCaption || article.heroCredit) && (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              {article.heroCaption}
              {article.heroCaption && article.heroCredit ? " · " : ""}
              {article.heroCredit ? <span className="font-medium">Crédito: {article.heroCredit}</span> : null}
            </figcaption>
          )}
        </figure>
      )}

      <div className="my-8">
        <AdSlot slot="article" />
      </div>

      <ArticleBody
        contentJson={article.contentJson}
        contentHtml={article.contentHtml}
        youtubeId={videoId}
        alsoRead={alsoRead}
      />

      {article.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {article.tags.map(({ tag }) => (
            <Link key={tag.id} href={`/etiqueta/${tag.slug}`}>
              <Badge variant="secondary">#{tag.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10">
        <AuthorCard author={author} />
      </div>

      {relatedFiltered.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-heading text-2xl font-black uppercase">Relacionadas</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {relatedFiltered.map((a) => (
              <ArticleCard key={a.id} article={a} variant="compact" />
            ))}
          </div>
        </section>
      )}

      <ArticleComments
        articleId={article.id}
        comments={comments.map((c) => ({
          id: c.id,
          name: c.name,
          body: c.body,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </article>
  );
}
