import sharp from "sharp";

export async function processRasterImage(buffer: Buffer, mime: string) {
  if (mime === "image/gif") {
    return { buffer, mime, ext: "gif" as const, width: null as number | null, height: null as number | null };
  }

  const pipeline = sharp(buffer, { failOn: "none" }).rotate().resize({
    width: 1920,
    height: 1920,
    fit: "inside",
    withoutEnlargement: true,
  });

  const webp = await pipeline.webp({ quality: 80 }).toBuffer();
  const meta = await sharp(webp).metadata();
  return {
    buffer: webp,
    mime: "image/webp",
    ext: "webp" as const,
    width: meta.width ?? null,
    height: meta.height ?? null,
  };
}
