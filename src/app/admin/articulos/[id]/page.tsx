import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { auth, canPublish } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleEditorForm } from "@/components/admin/article-editor-form";
import { buttonVariants } from "@/components/ui/button";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const [article, categories, authors, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase">Editar noticia</h1>
          <p className="text-sm text-muted-foreground">/{article.slug}</p>
        </div>
        {article.status === "PUBLISHED" && (
          <Link
            href={`/noticia/${article.slug}`}
            target="_blank"
            className={buttonVariants({ variant: "outline" })}
          >
            <ExternalLink className="h-4 w-4" />
            Ver en el sitio
          </Link>
        )}
      </div>
      <ArticleEditorForm
        categories={categories}
        authors={authors}
        tags={tags}
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          contentJson: article.contentJson as object,
          contentHtml: article.contentHtml,
          status: article.status,
          featured: article.featured,
          heroImageUrl: article.heroImageUrl ?? "",
          youtubeId: article.youtubeId ?? "",
          categoryId: article.categoryId,
          authorId: article.authorId,
          tagIds: article.tags.map((t) => t.tagId),
          canPublish: session?.user ? canPublish(session.user.role) : false,
        }}
      />
    </div>
  );
}
