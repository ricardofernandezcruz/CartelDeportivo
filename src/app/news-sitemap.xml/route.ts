import { getPublishedSitemapEntries } from "@/lib/articles";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 300;

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60_000);
  let articles: Awaited<ReturnType<typeof getPublishedSitemapEntries>> = [];
  try {
    articles = (await getPublishedSitemapEntries()).filter(
      (a) => a.publishedAt && a.publishedAt >= twoDaysAgo,
    );
  } catch {
    articles = [];
  }

  const urls = articles
    .map((a) => {
      const published = (a.publishedAt ?? a.updatedAt).toISOString();
      return `<url>
  <loc>${xmlEscape(absoluteUrl(`/noticia/${a.slug}`))}</loc>
  <news:news>
    <news:publication>
      <news:name>${xmlEscape(SITE_NAME)}</news:name>
      <news:language>es</news:language>
    </news:publication>
    <news:publication_date>${published}</news:publication_date>
    <news:title>${xmlEscape(a.title)}</news:title>
  </news:news>
</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
