"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEditor } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  color: z.string().trim().min(4).max(16),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export async function saveCategoryAction(input: z.infer<typeof categorySchema>) {
  const authz = await requireEditor();
  if (!authz.ok) return { ok: false as const, error: authz.error };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const data = parsed.data;
  const slugBase = toSlug(data.slug || data.name) || `categoria-${Date.now().toString(36)}`;
  let slug = slugBase;
  const clash = await prisma.category.findFirst({
    where: { slug, NOT: data.id ? { id: data.id } : undefined },
    select: { id: true },
  });
  if (clash) slug = `${slugBase}-${Date.now().toString(36)}`;

  const payload = {
    name: data.name,
    slug,
    description: data.description?.trim() || null,
    color: data.color,
    sortOrder: data.sortOrder,
  };

  const category = data.id
    ? await prisma.category.update({ where: { id: data.id }, data: payload })
    : await prisma.category.create({ data: payload });

  revalidatePath("/");
  revalidatePath("/admin/categorias");
  revalidatePath(`/categoria/${category.slug}`);
  return { ok: true as const, id: category.id };
}

export async function deleteCategoryAction(id: string) {
  const authz = await requireEditor();
  if (!authz.ok) return { ok: false as const, error: authz.error };

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { articles: true } } },
  });
  if (!category) return { ok: false as const, error: "Categoría no encontrada" };
  if (category._count.articles > 0) {
    return {
      ok: false as const,
      error: `No se puede borrar: tiene ${category._count.articles} noticia(s). Mueve esas notas a otra categoría primero.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/categorias");
  return { ok: true as const };
}
