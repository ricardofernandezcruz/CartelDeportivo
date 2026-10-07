import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sniffImageMime } from "@/lib/mime";
import { prisma } from "@/lib/prisma";
import { processRasterImage } from "@/lib/process-image";

export const runtime = "nodejs";
export const maxDuration = 30;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
/** Vercel Hobby limita el body ~4.5 MB; comprimir no ayuda porque llega el original. */
const MAX_BYTES = 4 * 1024 * 1024;

type CloudinaryOk = { url: string; publicId: string | null; width: number | null; height: number | null };

async function uploadToCloudinary(buffer: Buffer, filename: string, mime: string): Promise<CloudinaryOk | { error: string }> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    return { error: "Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET." };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "cartel-deportivo";
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");

  const body = new FormData();
  body.append("file", new Blob([new Uint8Array(buffer)], { type: mime }), filename);
  body.append("api_key", key);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  body.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body,
  });
  const data = (await res.json().catch(() => null)) as
    | { secure_url?: string; public_id?: string; width?: number; height?: number; error?: { message?: string } }
    | null;
  if (!res.ok || !data?.secure_url) {
    return { error: data?.error?.message ?? `Cloudinary respondió ${res.status}.` };
  }
  return {
    url: data.secure_url,
    publicId: data.public_id ?? null,
    width: data.width ?? null,
    height: data.height ?? null,
  };
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen no puede superar 4 MB." }, { status: 400 });
    }

    const raw = Buffer.from(await file.arrayBuffer());
    const sniff = sniffImageMime(raw);
    if (!sniff || !ALLOWED.has(sniff)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa JPG, PNG, WebP, AVIF o GIF reales." },
        { status: 400 },
      );
    }

    let processed: Awaited<ReturnType<typeof processRasterImage>>;
    try {
      processed = await processRasterImage(raw, sniff);
    } catch (err) {
      console.error("sharp failed", err);
      return NextResponse.json({ error: "No se pudo procesar la imagen." }, { status: 422 });
    }

    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    const filename = `${stamp}-${rand}.${processed.ext}`;

    const cloud = await uploadToCloudinary(processed.buffer, filename, processed.mime);
    if ("error" in cloud) {
      if (process.env.VERCEL) {
        return NextResponse.json({ error: cloud.error }, { status: 502 });
      }
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, filename), processed.buffer);
      const url = `/uploads/${filename}`;
      await prisma.mediaAsset
        .create({
          data: {
            url,
            alt: file.name.replace(/\.[^.]+$/, "").slice(0, 120),
            width: processed.width,
            height: processed.height,
            mimeType: processed.mime,
          },
        })
        .catch(() => null);
      return NextResponse.json({ url, filename, width: processed.width, height: processed.height });
    }

    const alt = file.name.replace(/\.[^.]+$/, "").slice(0, 120);
    const asset = await prisma.mediaAsset
      .create({
        data: {
          url: cloud.url,
          publicId: cloud.publicId,
          alt,
          width: cloud.width ?? processed.width,
          height: cloud.height ?? processed.height,
          mimeType: processed.mime,
        },
      })
      .catch(() => null);

    return NextResponse.json({
      url: cloud.url,
      filename,
      width: asset?.width ?? cloud.width ?? processed.width,
      height: asset?.height ?? cloud.height ?? processed.height,
    });
  } catch (err) {
    console.error("upload failed", err);
    return NextResponse.json({ error: "No se pudo subir la imagen." }, { status: 500 });
  }
}
