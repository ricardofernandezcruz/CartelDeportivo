import { auth, canPublish } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleEditorForm } from "@/components/admin/article-editor-form";

export default async function NewArticlePage() {
  const session = await auth();
  const [categories, authors, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Redacción</p>
        <h1 className="font-heading text-3xl font-black uppercase tracking-tight">Nueva noticia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          El asistente te dice qué falta. Puedes publicar ahora o programar fecha y hora: el sistema la sube solo.
        </p>
      </div>
      <ArticleEditorForm
        categories={categories}
        authors={authors}
        tags={tags}
        initial={{ canPublish: session?.user ? canPublish(session.user.role) : false }}
      />
    </div>
  );
}
