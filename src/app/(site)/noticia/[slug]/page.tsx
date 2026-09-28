import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/site/ad-slot";
import { YoutubeEmbed } from "@/components/site/youtube-embed";
import { ArticleCard } from "@/components/site/article-card";
import { AuthorByline, AuthorCard } from "@/components/site/author-card";
import { ShareActions } from "@/components/site/share-actions";
import { formatArticleDate } from "@/lib/format";
import { getArticleBySlug, getArticlesByCategory, incrementViewCount } from "@/lib/articles";
import type { Metadata } from "next";

export const revalidate = 120;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Noticia no encontrada" };
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.heroImageUrl ? [{ url: article.heroImageUrl }] : undefined,
      type: "article",
      authors: [article.author.name],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  await incrementViewCount(article.id);

  const related = await getArticlesByCategory(article.category.slug, 4);
  const relatedFiltered = related.filter((a) => a.id !== article.id).slice(0, 3);
  const dateLabel = formatArticleDate(article.publishedAt);
  const author = {
    name: article.author.name,
    slug: article.author.slug,
    bio: article.author.bio,
    avatarUrl: article.author.avatarUrl,
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
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
        <AuthorByline author={author} dateLabel={dateLabel} />
        <ShareActions title={article.title} slug={article.slug} />
      </div>

      {article.heroImageUrl && (
        <figure className="mt-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-sm">
            <Image
              src={article.heroImageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width:768px) 100vw, 900px"
              unoptimized={article.heroImageUrl.startsWith("/")}
            />
          </div>
        </figure>
      )}

      {article.youtubeId && <YoutubeEmbed videoId={article.youtubeId} title={article.title} />}

      <div className="my-8">
        <AdSlot />
      </div>

      <div
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:uppercase prose-a:text-[var(--cartel-red)] prose-blockquote:border-[var(--cartel-red)]"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      {article.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {article.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="secondary">
              #{tag.name}
            </Badge>
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
    </article>
  );
}
