import { getPublishedArticles } from "@/lib/articles";
import { absoluteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const revalidate = 300;

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  let articles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  try {
    articles = await getPublishedArticles(40);
  } catch {
    articles = [];
  }

  const items = articles
    .map((a) => {
      const link = absoluteUrl(`/noticia/${a.slug}`);
      const date = (a.publishedAt ?? a.updatedAt).toUTCString();
      return `<item>
  <title>${xmlEscape(a.title)}</title>
  <link>${xmlEscape(link)}</link>
  <guid>${xmlEscape(link)}</guid>
  <pubDate>${date}</pubDate>
  <description>${xmlEscape(a.excerpt ?? "")}</description>
  <category>${xmlEscape(a.category.name)}</category>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(SITE_NAME)}</title>
    <link>${xmlEscape(absoluteUrl("/"))}</link>
    <description>${xmlEscape(SITE_TAGLINE)}</description>
    <language>es-do</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
