import type { ReactNode } from "react";
import Link from "next/link";
import { YoutubeEmbed } from "@/components/site/youtube-embed";
import { SiteImage } from "@/components/site/site-image";
import { embedSrc, parseEmbed, type EmbedProvider } from "@/lib/embed";
import { publicImageUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type JsonNode = {
  type?: string;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
  content?: JsonNode[];
};

function textOf(node: JsonNode): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(textOf).join("");
}

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function quotesFromHtml(html: string, pullOnly = false) {
  const parts: Array<{ text: string; attribution: string }> = [];
  const re = /<blockquote([^>]*)>([\s\S]*?)<\/blockquote>/gi;
  for (const match of html.matchAll(re)) {
    const attrs = match[1] ?? "";
    const isPull = /data-pull-quote|data-text=/i.test(attrs);
    if (pullOnly && !isPull) continue;
    if (!pullOnly && isPull) continue;
    const inner = match[2] ?? "";
    const dataText = attrs.match(/data-text="([^"]*)"/i)?.[1];
    const dataAttr = attrs.match(/data-attribution="([^"]*)"/i)?.[1];
    const p = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? inner;
    const cite = inner.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i)?.[1] ?? "";
    const text = decodeHtml(dataText || p);
    if (!text) continue;
    parts.push({
      text,
      attribution: decodeHtml(dataAttr || cite).replace(/^[\s—-]+/, ""),
    });
  }
  return parts;
}

function withQuoteText(nodes: JsonNode[], html?: string) {
  const pull = html ? quotesFromHtml(html, true) : [];
  const regular = html ? quotesFromHtml(html, false) : [];
  let pullIndex = 0;
  let regularIndex = 0;
  return nodes.map((node) => {
    if (node.type !== "pullQuote" && node.type !== "blockquote") return node;
    const recovered = node.type === "pullQuote" ? pull[pullIndex++] : regular[regularIndex++];
    const text =
      String(node.attrs?.text ?? "").trim() || textOf(node).trim() || recovered?.text || "";
    const attribution =
      String(node.attrs?.attribution ?? "").trim() || recovered?.attribution || "";
    if (!text && !attribution) return node;
    return { ...node, attrs: { ...node.attrs, text, attribution } };
  });
}

function renderInline(nodes: JsonNode[] | undefined): ReactNode {
  if (!nodes?.length) return null;
  return nodes.map((n, i) => {
    if (n.type === "hardBreak") return <br key={i} />;
    let el: ReactNode = n.text ?? renderInline(n.content);
    for (const mark of n.marks ?? []) {
      if (mark.type === "bold") el = <strong key={`b-${i}`}>{el}</strong>;
      else if (mark.type === "italic") el = <em key={`i-${i}`}>{el}</em>;
      else if (mark.type === "underline") el = <u key={`u-${i}`}>{el}</u>;
      else if (mark.type === "link") {
        const href = String(mark.attrs?.href ?? "");
        el = (
          <a key={`a-${i}`} href={href} className="text-[var(--cartel-red)] underline">
            {el}
          </a>
        );
      }
    }
    return <span key={i}>{el}</span>;
  });
}

function videosFromHtml(html: string) {
  const parts: Array<{ url: string; provider: string; embedId: string }> = [];
  const re = /<div([^>]*data-video-embed[^>]*)>([\s\S]*?)<\/div>/gi;
  for (const match of html.matchAll(re)) {
    const attrs = match[1] ?? "";
    const inner = match[2] ?? "";
    const url =
      attrs.match(/data-url="([^"]*)"/i)?.[1] ||
      inner.match(/href="([^"]+)"/i)?.[1] ||
      "";
    const embedId = attrs.match(/data-embed-id="([^"]*)"/i)?.[1] || "";
    const provider = attrs.match(/data-provider="([^"]*)"/i)?.[1] || "";
    const parsed = parseEmbed(embedId || decodeHtml(url));
    if (!parsed && !url && !embedId) continue;
    parts.push({
      url: parsed?.url || decodeHtml(url),
      provider: parsed?.provider || provider || "youtube",
      embedId: parsed?.id || embedId,
    });
  }
  return parts;
}

function videoAttrs(node: JsonNode, fallback?: { url: string; provider: string; embedId: string } | null) {
  const url = String(node.attrs?.url ?? "").trim() || fallback?.url || "";
  const embedId = String(node.attrs?.embedId ?? "").trim() || fallback?.embedId || "";
  const parsed = parseEmbed(embedId || url);
  return {
    url: parsed?.url || url,
    provider: parsed?.provider || String(node.attrs?.provider ?? fallback?.provider ?? "youtube"),
    embedId: parsed?.id || embedId,
  };
}

function withMediaAttrs(nodes: JsonNode[], html?: string, youtubeId?: string | null) {
  const quoted = withQuoteText(nodes, html);
  const fromHtml = html ? videosFromHtml(html) : [];
  let videoIndex = 0;
  const sidebar = youtubeId ? parseEmbed(youtubeId) : null;
  let usedSidebar = false;
  return quoted.map((node) => {
    if (node.type !== "videoEmbed") return node;
    const recovered = fromHtml[videoIndex++];
    let next = videoAttrs(node, recovered);
    if (!next.embedId && sidebar && !usedSidebar) {
      next = { url: sidebar.url, provider: sidebar.provider, embedId: sidebar.id };
      usedSidebar = true;
    }
    return { ...node, attrs: { ...node.attrs, ...next } };
  });
}

function isRenderableVideo(node: JsonNode) {
  if (node.type !== "videoEmbed") return false;
  const v = videoAttrs(node);
  return Boolean(v.embedId || v.url);
}

function isMedia(node: JsonNode) {
  return node.type === "articleImage" || node.type === "videoEmbed" || node.type === "image" || node.type === "imageGallery";
}

function BlockImage({ attrs }: { attrs?: Record<string, unknown> }) {
  const src = publicImageUrl(String(attrs?.src ?? ""));
  if (!src) return null;
  const alt = String(attrs?.alt ?? "");
  const caption = String(attrs?.caption ?? "");
  const credit = String(attrs?.credit ?? "");
  const layout = String(attrs?.layout ?? "full");
  const half = layout === "half";
  return (
    <figure className={cn("my-8", half && "md:float-left md:mr-6 md:w-[48%] md:max-w-[48%]")}>
      <div className={cn("relative overflow-hidden rounded-2xl bg-muted", half ? "aspect-[4/3]" : "aspect-[16/9]")}>
        <SiteImage
          src={src}
          alt={alt || caption || "Imagen de la nota"}
          fill
          className="object-cover"
          sizes={half ? "(max-width:768px) 100vw, 420px" : "(max-width:768px) 100vw, 900px"}
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-2 text-sm text-muted-foreground">
          {caption}
          {caption && credit ? " · " : ""}
          {credit ? <span className="font-medium">Crédito: {credit}</span> : null}
        </figcaption>
      )}
    </figure>
  );
}

function BlockGallery({ attrs }: { attrs?: Record<string, unknown> }) {
  const raw = attrs?.images;
  const images = Array.isArray(raw) ? raw : [];
  const items = images
    .map((img) => {
      if (!img || typeof img !== "object") return null;
      const row = img as { src?: string; alt?: string; caption?: string };
      const src = publicImageUrl(row.src);
      if (!src) return null;
      return { src, alt: row.alt ?? "", caption: row.caption ?? "" };
    })
    .filter((x): x is { src: string; alt: string; caption: string } => Boolean(x));
  if (!items.length) return null;
  return (
    <div className="my-8 grid grid-cols-2 gap-2 md:grid-cols-3">
      {items.map((img, i) => (
        <figure key={`${img.src}-${i}`} className={cn("relative overflow-hidden rounded-xl bg-muted", i === 0 && items.length > 2 ? "col-span-2 aspect-[16/9] md:col-span-2" : "aspect-[4/3]")}>
          <SiteImage
            src={img.src}
            alt={img.alt || img.caption || "Foto de galería"}
            fill
            className="object-cover"
            sizes="(max-width:768px) 50vw, 300px"
          />
          {img.caption ? (
            <figcaption className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-[11px] text-white">
              {img.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

function BlockVideo({ attrs }: { attrs?: Record<string, unknown> }) {
  const parsed = parseEmbed(String(attrs?.embedId ?? "").trim() || String(attrs?.url ?? "").trim());
  const provider = (parsed?.provider ?? String(attrs?.provider ?? "youtube")) as EmbedProvider;
  const id = parsed?.id || String(attrs?.embedId ?? "").trim();
  const url = parsed?.url || String(attrs?.url ?? "").trim();
  if (provider === "youtube" && id) {
    return <YoutubeEmbed videoId={id} />;
  }
  const src = id ? embedSrc({ provider, id, url: url || parsed?.url || "" }) : "";
  if (!src) {
    return url ? (
      <p className="my-6">
        <a href={url} className="text-[var(--cartel-red)] underline" target="_blank" rel="noreferrer">
          Ver video
        </a>
      </p>
    ) : null;
  }
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-border bg-black">
      <div className={cn("relative w-full", provider === "youtube" ? "aspect-video" : "aspect-[9/16] max-h-[720px]")}>
        <iframe title="Video" src={src} className="absolute inset-0 h-full w-full" allowFullScreen />
      </div>
    </div>
  );
}

function layout(
  nodes: JsonNode[],
  injectedYoutubeId?: string | null,
  alsoRead?: { slug: string; title: string } | null,
) {
  const out: JsonNode[] = [];
  let paragraphs = 0;
  let injected = !injectedYoutubeId;
  let alsoInserted = !alsoRead;
  const hasVideo = nodes.some(isRenderableVideo);

  let mediaIndex = 0;

  for (const node of nodes) {
    if (node.type === "paragraph" && textOf(node).trim()) paragraphs += 1;
    const prev = out[out.length - 1];
    if (isMedia(node) && prev && isMedia(prev)) {
      out.push({ type: "paragraph", content: [] });
    }
    let next = node;
    if (next.type === "articleImage" || next.type === "image") {
      const layout = mediaIndex % 2 === 0 ? "full" : "half";
      mediaIndex += 1;
      next = { ...next, attrs: { ...next.attrs, layout: next.attrs?.layout ?? layout } };
    }
    out.push(next);
    if (!injected && !hasVideo && paragraphs === 2) {
      out.push({
        type: "videoEmbed",
        attrs: { provider: "youtube", embedId: injectedYoutubeId, url: `https://www.youtube.com/watch?v=${injectedYoutubeId}` },
      });
      injected = true;
    }
    if (!alsoInserted && paragraphs === 4) {
      out.push({
        type: "alsoRead",
        attrs: { slug: alsoRead?.slug, title: alsoRead?.title },
      });
      alsoInserted = true;
    }
  }
  if (!injected && !hasVideo && injectedYoutubeId) {
    out.push({
      type: "videoEmbed",
      attrs: { provider: "youtube", embedId: injectedYoutubeId, url: `https://www.youtube.com/watch?v=${injectedYoutubeId}` },
    });
  }
  return out;
}

function Block({ node }: { node: JsonNode }) {
  switch (node.type) {
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const Tag = (level === 3 ? "h3" : "h2") as "h2" | "h3";
      return (
        <Tag className="font-heading mt-10 mb-4 text-2xl font-black uppercase tracking-tight">
          {renderInline(node.content)}
        </Tag>
      );
    }
    case "paragraph":
      return <p className="my-4 text-lg leading-relaxed">{renderInline(node.content)}</p>;
    case "blockquote": {
      const quote = String(node.attrs?.text ?? "").trim() || textOf(node).trim();
      if (!quote) return null;
      return (
        <blockquote className="my-6 border-l-4 border-[var(--cartel-red)] pl-4 text-lg italic">
          {node.content?.length ? (
            node.content.map((c, i) => <Block key={i} node={c} />)
          ) : (
            <p>{quote}</p>
          )}
        </blockquote>
      );
    }
    case "pullQuote": {
      const quote = String(node.attrs?.text ?? "").trim() || textOf(node).trim();
      const attribution = String(node.attrs?.attribution ?? "").trim();
      if (!quote) return null;
      return (
        <blockquote className="my-8 rounded-2xl border-l-4 border-[var(--cartel-red)] bg-[var(--cartel-blue)]/5 px-6 py-5">
          <p className="font-heading text-2xl font-black leading-snug tracking-tight">{quote}</p>
          {attribution ? (
            <cite className="mt-3 block text-sm not-italic font-semibold text-muted-foreground">
              — {attribution}
            </cite>
          ) : null}
        </blockquote>
      );
    }
    case "articleImage":
    case "image":
      return <BlockImage attrs={node.attrs} />;
    case "imageGallery":
      return <BlockGallery attrs={node.attrs} />;
    case "videoEmbed":
      return <BlockVideo attrs={node.attrs} />;
    case "alsoRead": {
      const slug = String(node.attrs?.slug ?? "");
      const title = String(node.attrs?.title ?? "");
      if (!slug || !title) return null;
      return (
        <aside className="my-8 rounded-xl border border-[var(--cartel-blue)]/25 bg-[var(--cartel-blue)]/5 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--cartel-blue)]">Lee también</p>
          <Link href={`/noticia/${slug}`} className="mt-1 block font-heading text-lg font-black uppercase leading-snug hover:text-[var(--cartel-red)]">
            {title}
          </Link>
        </aside>
      );
    }
    case "bulletList":
      return (
        <ul className="my-4 list-disc space-y-1 pl-6 text-lg">
          {(node.content ?? []).map((li, i) => (
            <li key={i}>{renderInline(li.content?.[0]?.content ?? li.content)}</li>
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol className="my-4 list-decimal space-y-1 pl-6 text-lg">
          {(node.content ?? []).map((li, i) => (
            <li key={i}>{renderInline(li.content?.[0]?.content ?? li.content)}</li>
          ))}
        </ol>
      );
    default:
      if (node.content?.length) {
        return (
          <>
            {node.content.map((c, i) => (
              <Block key={i} node={c} />
            ))}
          </>
        );
      }
      return null;
  }
}

export function ArticleBody({
  contentJson,
  contentHtml,
  youtubeId,
  alsoRead,
}: {
  contentJson?: unknown;
  contentHtml?: string;
  youtubeId?: string | null;
  alsoRead?: { slug: string; title: string } | null;
}) {
  const doc = contentJson as JsonNode | undefined;
  const nodes = withMediaAttrs(doc?.type === "doc" ? doc.content ?? [] : [], contentHtml, youtubeId);

  if (!nodes.length && contentHtml) {
    return (
      <div
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:uppercase prose-a:text-[var(--cartel-red)] prose-blockquote:border-[var(--cartel-red)]"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  const laid = layout(nodes, youtubeId, alsoRead);

  return (
    <div className="max-w-none after:clear-both after:block after:content-['']">
      {laid.map((node, i) => (
        <Block key={i} node={node} />
      ))}
    </div>
  );
}
