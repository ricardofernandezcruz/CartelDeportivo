import { prisma } from "@/lib/prisma";

const MEILI_HOST = process.env.MEILI_HOST;
const MEILI_KEY = process.env.MEILI_MASTER_KEY ?? "";
const INDEX = "articles";

export type SearchHit = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  categorySlug: string;
  categoryName: string;
  publishedAt: string | null;
  heroImageUrl: string | null;
};

async function searchMeili(query: string, limit = 12): Promise<SearchHit[] | null> {
  if (!MEILI_HOST || !query.trim()) return null;

  try {
    const res = await fetch(
      `${MEILI_HOST}/indexes/${INDEX}/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(MEILI_KEY ? { Authorization: `Bearer ${MEILI_KEY}` } : {}),
        },
        body: JSON.stringify({ q: query, limit }),
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) return null;
    const data = (await res.json()) as { hits: SearchHit[] };
    return data.hits;
  } catch {
    return null;
  }
}

export async function searchArticles(query: string, limit = 12): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const meili = await searchMeili(trimmed, limit);
  if (meili) return meili;

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: trimmed, mode: "insensitive" } },
        { excerpt: { contains: trimmed, mode: "insensitive" } },
        { contentHtml: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    categorySlug: a.category.slug,
    categoryName: a.category.name,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    heroImageUrl: a.heroImageUrl,
  }));
}

export async function syncArticleToMeili(article: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  publishedAt: Date | null;
  heroImageUrl: string | null;
  category: { slug: string; name: string };
}): Promise<void> {
  if (!MEILI_HOST || article.status !== "PUBLISHED") return;

  try {
    await fetch(`${MEILI_HOST}/indexes/${INDEX}/documents`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(MEILI_KEY ? { Authorization: `Bearer ${MEILI_KEY}` } : {}),
      },
      body: JSON.stringify([
        {
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          categorySlug: article.category.slug,
          categoryName: article.category.name,
          publishedAt: article.publishedAt?.toISOString() ?? null,
          heroImageUrl: article.heroImageUrl,
        },
      ]),
    });
  } catch {
    /* Meili opcional en demo */
  }
}

export async function ensureMeiliIndex(): Promise<void> {
  if (!MEILI_HOST) return;
  try {
    await fetch(`${MEILI_HOST}/indexes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(MEILI_KEY ? { Authorization: `Bearer ${MEILI_KEY}` } : {}),
      },
      body: JSON.stringify({ uid: INDEX, primaryKey: "id" }),
    });
  } catch {
    /* ya existe */
  }
}
