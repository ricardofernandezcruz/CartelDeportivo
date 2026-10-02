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
