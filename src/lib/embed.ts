export type EmbedProvider = "youtube" | "tiktok" | "instagram" | "x";

export type ParsedEmbed = {
  provider: EmbedProvider;
  id: string;
  url: string;
};

function asUrl(raw: string): URL | null {
  const v = raw.trim();
  if (!v) return null;
  try {
    return new URL(v.startsWith("http") ? v : `https://${v}`);
  } catch {
    return null;
  }
}

export function parseEmbed(raw: string): ParsedEmbed | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^[\w-]{11}$/.test(v)) {
    return { provider: "youtube", id: v, url: `https://www.youtube.com/watch?v=${v}` };
  }
  const url = asUrl(v);
  if (!url) return null;
  const host = url.hostname.replace(/^www\./, "");

  if (host.includes("youtu.be")) {
    const id = url.pathname.replace("/", "").slice(0, 11);
    if (id.length === 11) return { provider: "youtube", id, url: v };
  }
  if (host.includes("youtube.com")) {
    const id = url.searchParams.get("v")?.slice(0, 11);
    if (id) return { provider: "youtube", id, url: v };
    const parts = url.pathname.split("/").filter(Boolean);
    const i = parts.findIndex((p) => p === "shorts" || p === "embed" || p === "live");
    if (i >= 0 && parts[i + 1]) {
      return { provider: "youtube", id: parts[i + 1].slice(0, 11), url: v };
    }
  }

  if (host.includes("tiktok.com")) {
    const m = url.pathname.match(/\/video\/(\d+)/);
    if (m) return { provider: "tiktok", id: m[1], url: v };
  }

  if (host.includes("instagram.com")) {
    const m = url.pathname.match(/\/(p|reel|reels)\/([^/]+)/);
    if (m) return { provider: "instagram", id: m[2], url: v };
  }

  if (host === "x.com" || host === "twitter.com") {
    const m = url.pathname.match(/\/status\/(\d+)/);
    if (m) return { provider: "x", id: m[1], url: v };
  }

  return null;
}

export function embedSrc(embed: ParsedEmbed) {
  switch (embed.provider) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${embed.id}`;
    case "tiktok":
      return `https://www.tiktok.com/embed/v2/${embed.id}`;
    case "instagram":
      return `https://www.instagram.com/p/${embed.id}/embed`;
    case "x":
      return `https://platform.twitter.com/embed/Tweet.html?id=${embed.id}`;
  }
}

export function embedLabel(provider: EmbedProvider) {
  return { youtube: "YouTube", tiktok: "TikTok", instagram: "Instagram", x: "X" }[provider];
}
