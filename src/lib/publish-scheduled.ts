import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncArticleToMeili } from "@/lib/search";

/** Publica noticias SCHEDULED cuya hora ya llegó. */
export async function publishDueArticles() {
  const now = new Date();
  const due = await prisma.article.findMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: { lte: now },
    },
    include: { category: true },
    take: 50,
  });

  if (!due.length) return { published: 0, ids: [] as string[] };

  const ids: string[] = [];

  for (const article of due) {
    const updated = await prisma.article.update({
      where: { id: article.id },
      data: {
        status: "PUBLISHED",
        publishedAt: article.scheduledFor ?? now,
      },
      include: { category: true },
    });
    await syncArticleToMeili(updated);
    ids.push(updated.id);
    revalidatePath(`/noticia/${updated.slug}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/articulos");

  return { published: ids.length, ids };
}
