import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG, WebP o GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen no puede superar 6 MB." }, { status: 400 });
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const filename = `${stamp}-${rand}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url, filename });
}
