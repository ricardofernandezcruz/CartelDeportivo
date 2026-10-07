import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/articles";
import { publicImageUrl } from "@/lib/media";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const title = article?.title ?? SITE_NAME;
  const category = article?.category.name ?? "Deportes";
  const coverRaw = publicImageUrl(article?.heroImageUrl);
  const photo =
    coverRaw && !coverRaw.endsWith(".svg")
      ? coverRaw.startsWith("http")
        ? coverRaw
        : absoluteUrl(coverRaw)
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #0B3A82 0%, #081428 55%, #C8102E 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: photo
              ? "linear-gradient(90deg, rgba(8,20,40,0.88) 0%, rgba(8,20,40,0.55) 55%, rgba(200,16,46,0.45) 100%)"
              : "transparent",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
            width: "1200px",
            height: "630px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 999,
                background: "#0B3A82",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              CD
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {SITE_NAME}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: "#C8102E",
                padding: "8px 16px",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
            <div
              style={{
                fontSize: title.length > 70 ? 48 : 58,
                fontWeight: 900,
                lineHeight: 1.05,
                textTransform: "uppercase",
              }}
            >
              {title}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
