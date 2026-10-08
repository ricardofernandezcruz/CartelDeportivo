import { Node, mergeAttributes } from "@tiptap/core";

export const ArticleImage = Node.create({
  name: "articleImage",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      credit: { default: "" },
      caption: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: "figure[data-article-image]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const { src, alt, credit, caption } = HTMLAttributes as {
      src: string;
      alt: string;
      credit: string;
      caption: string;
    };
    const captionBits = [caption, credit].filter(Boolean).join(" — ");
    return [
      "figure",
      mergeAttributes({ "data-article-image": "", class: "my-6" }),
      ["img", { src, alt: alt || "", class: "w-full rounded-xl" }],
      captionBits ? ["figcaption", { class: "mt-2 text-sm text-muted-foreground" }, captionBits] : ["span", {}],
    ];
  },
});

export const PullQuote = Node.create({
  name: "pullQuote",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      text: {
        default: "",
        parseHTML: (el) =>
          el.getAttribute("data-text") || el.querySelector("p")?.textContent?.trim() || "",
        renderHTML: (attrs) => (attrs.text ? { "data-text": String(attrs.text) } : {}),
      },
      attribution: {
        default: "",
        parseHTML: (el) =>
          el.getAttribute("data-attribution") ||
          el.querySelector("cite")?.textContent?.replace(/^[\s—-]+/, "").trim() ||
          "",
        renderHTML: (attrs) =>
          attrs.attribution ? { "data-attribution": String(attrs.attribution) } : {},
      },
      featured: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: "blockquote[data-pull-quote]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const text = String(HTMLAttributes["data-text"] ?? HTMLAttributes.text ?? "");
    const attribution = String(HTMLAttributes["data-attribution"] ?? HTMLAttributes.attribution ?? "");
    const rest = { ...HTMLAttributes } as Record<string, unknown>;
    delete rest.text;
    delete rest.attribution;
    delete rest.featured;
    return [
      "blockquote",
      mergeAttributes(rest, {
        "data-pull-quote": "",
        class: "my-8 rounded-2xl border-l-4 border-[var(--cartel-red)] bg-muted/40 px-6 py-5",
      }),
      ["p", { class: "font-heading text-xl font-bold leading-snug" }, text],
      attribution
        ? ["cite", { class: "mt-3 block text-sm not-italic text-muted-foreground" }, attribution]
        : ["span", {}],
    ];
  },
});

export const ImageGallery = Node.create({
  name: "imageGallery",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      images: {
        default: [] as Array<{ src: string; alt: string; caption?: string }>,
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-images") || "[]") as Array<{
              src: string;
              alt: string;
              caption?: string;
            }>;
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-images": JSON.stringify(attrs.images ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-image-gallery]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const images = (HTMLAttributes.images ?? []) as Array<{ src: string; alt: string }>;
    return [
      "div",
      mergeAttributes({
        "data-image-gallery": "",
        "data-images": JSON.stringify(images),
        class: "my-6 grid grid-cols-2 gap-2",
      }),
      ...images.slice(0, 4).map((img) => ["img", { src: img.src, alt: img.alt || "", class: "rounded-lg" }]),
    ];
  },
});

export const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      url: {
        default: "",
        parseHTML: (el) =>
          el.getAttribute("data-url") || el.querySelector("a")?.getAttribute("href") || "",
        renderHTML: (attrs) => (attrs.url ? { "data-url": String(attrs.url) } : {}),
      },
      provider: {
        default: "youtube",
        parseHTML: (el) => el.getAttribute("data-provider") || "youtube",
        renderHTML: (attrs) => ({ "data-provider": String(attrs.provider || "youtube") }),
      },
      embedId: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-embed-id") || "",
        renderHTML: (attrs) => (attrs.embedId ? { "data-embed-id": String(attrs.embedId) } : {}),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-video-embed]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const url = String(HTMLAttributes["data-url"] ?? HTMLAttributes.url ?? "");
    const rest = { ...HTMLAttributes } as Record<string, unknown>;
    delete rest.url;
    delete rest.provider;
    delete rest.embedId;
    return [
      "div",
      mergeAttributes(rest, {
        "data-video-embed": "",
        class: "my-6 rounded-xl border border-border bg-muted/30 p-3 text-sm",
      }),
      ["a", { href: url || "#", target: "_blank", rel: "noreferrer" }, url || "Video"],
    ];
  },
});
