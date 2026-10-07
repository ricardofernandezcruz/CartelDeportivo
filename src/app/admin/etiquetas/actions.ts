"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEditor } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";
import type { TagType } from "@prisma/client";

const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  slug: z.string().trim().optional(),
  type: z.enum(["TEAM", "PLAYER", "TOPIC"]),
});

export async function saveTagAction(input: z.infer<typeof tagSchema>) {
  const authz = await requireEditor();
  if (!authz.ok) return { ok: false as const, error: authz.error };

  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const data = parsed.data;
  const slugBase = toSlug(data.slug || data.name) || `tag-${Date.now().toString(36)}`;
  let slug = slugBase;
  const clash = await prisma.tag.findFirst({
    where: { slug, NOT: data.id ? { id: data.id } : undefined },
    select: { id: true },
  });
  if (clash) slug = `${slugBase}-${Date.now().toString(36)}`;

  const payload = { name: data.name, slug, type: data.type as TagType };

  const tag = data.id
    ? await prisma.tag.update({ where: { id: data.id }, data: payload })
    : await prisma.tag.create({ data: payload });

  revalidatePath("/admin/etiquetas");
  revalidatePath("/admin/articulos");
  return { ok: true as const, id: tag.id };
}

export async function deleteTagAction(id: string) {
  const authz = await requireEditor();
  if (!authz.ok) return { ok: false as const, error: authz.error };

  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) return { ok: false as const, error: "Etiqueta no encontrada" };

  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/etiquetas");
  revalidatePath("/admin/articulos");
  return { ok: true as const };
}
