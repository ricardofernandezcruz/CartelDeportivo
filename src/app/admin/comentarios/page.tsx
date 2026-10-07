import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommentsManager } from "@/app/admin/comentarios/comments-manager";

export default async function AdminCommentsPage() {
  const session = await auth();
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { article: { select: { title: true, slug: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase">Comentarios</h1>
        <p className="text-sm text-muted-foreground">Aprueba o rechaza lo que llega del sitio.</p>
      </div>
      <CommentsManager
        canModerate={session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"}
        comments={comments.map((c) => ({
          id: c.id,
          name: c.name,
          body: c.body,
          status: c.status,
          createdAt: c.createdAt.toISOString(),
          articleTitle: c.article.title,
          articleSlug: c.article.slug,
        }))}
      />
    </div>
  );
}
