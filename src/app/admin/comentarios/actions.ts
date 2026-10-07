"use server";

import { revalidatePath } from "next/cache";
import { auth, canPublish } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CommentStatus } from "@prisma/client";

export async function setCommentStatusAction(id: string, status: CommentStatus) {
  const session = await auth();
  if (!session?.user || !canPublish(session.user.role)) {
    return { ok: false as const, error: "Sin permiso" };
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { status },
    include: { article: { select: { slug: true } } },
  });

  revalidatePath("/admin/comentarios");
  revalidatePath(`/noticia/${comment.article.slug}`);
  return { ok: true as const };
}
