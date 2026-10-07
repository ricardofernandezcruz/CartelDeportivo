const MAGIC: Array<{ mime: string; test: (buf: Buffer) => boolean }> = [
  {
    mime: "image/jpeg",
    test: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    mime: "image/png",
    test: (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  },
  {
    mime: "image/gif",
    test: (buf) => {
      if (buf.length < 6) return false;
      const header = buf.toString("ascii", 0, 6);
      return header === "GIF87a" || header === "GIF89a";
    },
  },
  {
    mime: "image/webp",
    test: (buf) =>
      buf.length >= 12 &&
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WEBP",
  },
  {
    mime: "image/avif",
    test: (buf) =>
      buf.length >= 12 &&
      buf.toString("ascii", 4, 8) === "ftyp" &&
      buf.toString("ascii", 0, Math.min(buf.length, 32)).includes("avif"),
  },
];

export function sniffImageMime(buffer: Buffer): string | null {
  for (const row of MAGIC) {
    if (row.test(buffer)) return row.mime;
  }
  return null;
}

export function extForImageMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/avif") return "avif";
  return "jpg";
}
