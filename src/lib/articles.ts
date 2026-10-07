import { prisma } from "@/lib/prisma";
import type { ArticleStatus, Prisma } from "@prisma/client";
import { publishDueArticles } from "@/lib/publish-scheduled";

export const articleListInclude = {
  category: true,
  author: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ArticleInclude;

export async function getPublishedArticles(limit = 20) {
  // Red de seguridad si el cron aún no corrió
  await publishDueArticles().catch(() => null);
  const { scrubDemoMediaOnce } = await import("@/lib/scrub-demo-media");
  await scrubDemoMediaOnce();

  return prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: articleListInclude,
  });
}

export async function getFeaturedArticles(limit = 5) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      featured: true,
      publishedAt: { lte: new Date() },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: articleListInclude,
  });
}

export async function getHeroSlides(limit = 4) {
  return getFeaturedArticles(limit);
}

export async function getArticlesByCategory(slug: string, limit = 24) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      category: { slug },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: articleListInclude,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    include: articleListInclude,
  });
}

export async function getMostViewed(limit = 5) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { viewCount: "desc" },
    take: limit,
    include: articleListInclude,
  });
}

export async function incrementViewCount(articleId: string) {
  await prisma.article.update({
    where: { id: articleId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getArticlesByTag(slug: string, limit = 24) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      tags: { some: { tag: { slug } } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: articleListInclude,
  });
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}

export async function getRelatedArticles(
  article: { id: string; categoryId: string; tags: { tagId: string }[] },
  limit = 6,
) {
  const tagIds = article.tags.map((t) => t.tagId);
  const tagged =
    tagIds.length > 0
      ? await prisma.article.findMany({
          where: {
            id: { not: article.id },
            status: "PUBLISHED",
            publishedAt: { lte: new Date() },
            tags: { some: { tagId: { in: tagIds } } },
          },
          orderBy: { publishedAt: "desc" },
          take: limit,
          include: articleListInclude,
        })
      : [];

  if (tagged.length >= limit) return tagged;

  const extra = await prisma.article.findMany({
    where: {
      id: { notIn: [article.id, ...tagged.map((a) => a.id)] },
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      categoryId: article.categoryId,
    },
    orderBy: { publishedAt: "desc" },
    take: limit - tagged.length,
    include: articleListInclude,
  });

  return [...tagged, ...extra];
}

export async function getApprovedComments(articleId: string) {
  return prisma.comment.findMany({
    where: { articleId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: { id: true, name: true, body: true, createdAt: true },
  });
}

export async function getPublishedSitemapEntries() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, publishedAt: true, updatedAt: true, title: true },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getOpinionArticles(limit = 4) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      tags: { some: { tag: { slug: "opinion" } } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: articleListInclude,
  });
}

export async function getPublishedArticlesByAuthor(authorSlug: string, limit?: number) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      author: { slug: authorSlug },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: articleListInclude,
  });
}

export async function getStoryArticles(limit = 8) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      OR: [{ youtubeId: { not: null } }, { featured: true }],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: articleListInclude,
  });
}

export async function getAdminArticles(status?: ArticleStatus) {
  return prisma.article.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
    include: articleListInclude,
  });
}
