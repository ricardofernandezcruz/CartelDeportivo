import type { MetadataRoute } from "next";
import { getAllCategories, getPublishedSitemapEntries } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Awaited<ReturnType<typeof getPublishedSitemapEntries>> = [];
  let categories: { slug: string; updatedAt: Date }[] = [];
  let tags: { slug: string; updatedAt: Date }[] = [];

  try {
    [articles, categories, tags] = await Promise.all([
      getPublishedSitemapEntries(),
      getAllCategories().then((rows) => rows.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt }))),
      prisma.tag.findMany({ select: { slug: true, updatedAt: true } }),
    ]);
  } catch {
    /* DB down: still expose static URLs */
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/acerca"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/privacidad"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terminos"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/buscar"), changeFrequency: "weekly", priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: absoluteUrl(`/categoria/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
    ...tags.map((t) => ({
      url: absoluteUrl(`/etiqueta/${t.slug}`),
      lastModified: t.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
    ...articles.map((a) => ({
      url: absoluteUrl(`/noticia/${a.slug}`),
      lastModified: a.updatedAt ?? a.publishedAt ?? new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
