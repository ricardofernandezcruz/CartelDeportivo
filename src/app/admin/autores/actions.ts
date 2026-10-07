"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEditor } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";

const authorSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  avatarUrl: z.string().trim().nullable().optional(),
  column: z.string().trim().optional(),
  role: z.string().trim().optional(),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(999),
  facebook: z.string().trim().optional(),
  twitter: z.string().trim().optional(),
  tiktok: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
});

function emptyToNull(v?: string | null) {
  const t = v?.trim();
  return t ? t : null;
}

export async function saveAuthorAction(input: z.infer<typeof authorSchema>) {
  const authz = await requireEditor();
  if (!authz.ok) return { ok: false as const, error: authz.error };

  const parsed = authorSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const data = parsed.data;
  const slugBase = toSlug(data.slug || data.name) || `autor-${Date.now().toString(36)}`;
  let slug = slugBase;

  const clash = await prisma.author.findFirst({
    where: { slug, NOT: data.id ? { id: data.id } : undefined },
    select: { id: true },
  });
  if (clash) slug = `${slugBase}-${Date.now().toString(36)}`;

  const payload = {
    name: data.name,
    slug,
    bio: emptyToNull(data.bio),
    avatarUrl: emptyToNull(data.avatarUrl),
    column: emptyToNull(data.column),
    role: emptyToNull(data.role),
    featured: data.featured,
    sortOrder: data.sortOrder,
    facebook: emptyToNull(data.facebook),
    twitter: emptyToNull(data.twitter),
    tiktok: emptyToNull(data.tiktok),
    instagram: emptyToNull(data.instagram),
  };

  const author = data.id
    ? await prisma.author.update({ where: { id: data.id }, data: payload })
    : await prisma.author.create({ data: payload });

  revalidatePath("/");
  revalidatePath("/admin/autores");
  revalidatePath(`/autor/${author.slug}`);
  revalidatePath(`/autor/${author.slug}/noticias`);

  return { ok: true as const, id: author.id, slug: author.slug };
}

export async function deleteAuthorAction(id: string) {
  const authz = await requireEditor();
  if (!authz.ok) return { ok: false as const, error: authz.error };

  const author = await prisma.author.findUnique({
    where: { id },
    include: { _count: { select: { articles: true } } },
  });
  if (!author) return { ok: false as const, error: "Autor no encontrado" };
  if (author._count.articles > 0) {
    return {
      ok: false as const,
      error: `No se puede borrar: tiene ${author._count.articles} noticia(s). Reasigna o borra esas notas primero.`,
    };
  }

  await prisma.author.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/autores");
  revalidatePath(`/autor/${author.slug}`);
  return { ok: true as const };
}
