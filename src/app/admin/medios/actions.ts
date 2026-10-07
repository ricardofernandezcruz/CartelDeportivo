"use server";

import { unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { auth, canPublish } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateMediaAltAction(id: string, alt: string) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Sin permiso" };

  await prisma.mediaAsset.update({
    where: { id },
    data: { alt: alt.trim().slice(0, 180) || null },
  });
  revalidatePath("/admin/medios");
  return { ok: true as const };
}

export async function deleteMediaAction(id: string) {
  const session = await auth();
  if (!session?.user || !canPublish(session.user.role)) {
    return { ok: false as const, error: "Sin permiso" };
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { ok: false as const, error: "No existe" };

  if (asset.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", asset.url);
    await unlink(filePath).catch(() => null);
  }

  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/medios");
  return { ok: true as const };
}
