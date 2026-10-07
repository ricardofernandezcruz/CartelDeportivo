"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, canPublish } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";
import { syncArticleToMeili } from "@/lib/search";
import { Prisma, type ArticleStatus } from "@prisma/client";

const saveSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(8, "El titular debe tener al menos 8 caracteres"),
  excerpt: z.string().optional(),
  contentJson: z.custom<Prisma.InputJsonValue>((v) => typeof v === "object" && v !== null),
  contentHtml: z.string().min(1),
  status: z.enum(["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED"]),
  featured: z.boolean(),
  heroImageUrl: z.string().nullable(),
  youtubeId: z.string().nullable(),
  categoryId: z.string(),
  authorId: z.string(),
  tagIds: z.array(z.string()),
  scheduledFor: z.string().datetime().nullable().optional(),
});

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function saveArticleAction(input: z.infer<typeof saveSchema>) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "No autenticado" };

  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const data = parsed.data;
  if ((data.status === "PUBLISHED" || data.status === "SCHEDULED") && !canPublish(session.user.role)) {
    return { ok: false as const, error: "Tu rol no puede publicar ni programar" };
  }

  if (data.status === "SCHEDULED") {
    if (!data.scheduledFor) {
      return { ok: false as const, error: "Elige fecha y hora para programar la noticia" };
    }
    if (new Date(data.scheduledFor).getTime() <= Date.now()) {
      return { ok: false as const, error: "La programación debe ser en el futuro" };
    }
  }

  const bodyText = stripHtml(data.contentHtml);
  if ((data.status === "PUBLISHED" || data.status === "SCHEDULED") && bodyText.length < 40) {
    return {
      ok: false as const,
      error: "Escribe al menos un párrafo antes de publicar o programar",
    };
  }

  const existing = data.id
    ? await prisma.article.findUnique({
        where: { id: data.id },
        select: { slug: true, publishedAt: true, status: true },
      })
    : null;

  const slugBase = existing?.slug || toSlug(data.title);
  let slug = slugBase;
  const existingSlug = await prisma.article.findFirst({
    where: { slug, NOT: data.id ? { id: data.id } : undefined },
  });
  if (existingSlug) slug = `${slugBase}-${Date.now().toString(36)}`;

  const scheduledFor =
    data.status === "SCHEDULED" && data.scheduledFor ? new Date(data.scheduledFor) : null;

  const publishedAt =
    data.status === "PUBLISHED"
      ? existing?.publishedAt ?? new Date()
      : data.status === "SCHEDULED"
        ? null
        : undefined;

  const article = data.id
    ? await prisma.article.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          contentJson: data.contentJson as Prisma.InputJsonValue,
          contentHtml: data.contentHtml,
          status: data.status as ArticleStatus,
          featured: data.featured,
          heroImageUrl: data.heroImageUrl,
          youtubeId: data.youtubeId,
          categoryId: data.categoryId,
          authorId: data.authorId,
          userId: session.user.id,
          scheduledFor,
          ...(publishedAt !== undefined ? { publishedAt } : {}),
          tags: {
            deleteMany: {},
            create: data.tagIds.map((tagId) => ({ tagId })),
          },
        },
        include: { category: true },
      })
    : await prisma.article.create({
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          contentJson: data.contentJson as Prisma.InputJsonValue,
          contentHtml: data.contentHtml,
          status: data.status as ArticleStatus,
          featured: data.featured,
          heroImageUrl: data.heroImageUrl,
          youtubeId: data.youtubeId,
          categoryId: data.categoryId,
          authorId: data.authorId,
          userId: session.user.id,
          scheduledFor,
          publishedAt: publishedAt ?? null,
          tags: {
            create: data.tagIds.map((tagId) => ({ tagId })),
          },
        },
        include: { category: true },
      });

  if (data.status === "PUBLISHED") {
    const indexed = await prisma.article.findUnique({
      where: { id: article.id },
      include: { category: true },
    });
    if (indexed) await syncArticleToMeili(indexed);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/articulos");
  revalidatePath(`/noticia/${article.slug}`);

  return {
    ok: true as const,
    id: article.id,
    slug: article.slug,
    status: article.status,
    scheduledFor: article.scheduledFor?.toISOString() ?? null,
  };
}

export async function deleteArticleAction(id: string) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "No autenticado" };

  const article = await prisma.article.findUnique({
    where: { id },
    select: { id: true, slug: true, userId: true },
  });
  if (!article) return { ok: false as const, error: "Noticia no encontrada" };

  if (session.user.role === "WRITER" && article.userId !== session.user.id) {
    return { ok: false as const, error: "Solo puedes borrar tus propias notas" };
  }

  await prisma.article.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/articulos");
  revalidatePath(`/noticia/${article.slug}`);
  return { ok: true as const };
}
