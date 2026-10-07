import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  articleId: z.string().min(8),
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  body: z.string().trim().min(8, "El comentario es muy corto").max(1200),
});

export async function POST(request: Request) {
  const limited = rateLimit(`comment:${clientIpFromHeaders(request.headers)}`, { max: 8, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Demasiados comentarios. Espera un rato." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const article = await prisma.article.findFirst({
    where: { id: parsed.data.articleId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!article) {
    return NextResponse.json({ error: "Noticia no encontrada" }, { status: 404 });
  }

  await prisma.comment.create({
    data: {
      articleId: article.id,
      name: parsed.data.name,
      body: parsed.data.body,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true });
}
