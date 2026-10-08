import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { auth, canPublish } from "@/lib/auth";
import { formatSchedule } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { ArticleEditorForm } from "@/components/admin/article-editor-form";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";
import { buttonVariants } from "@/components/ui/button";

const FLASH_VALUES = ["publicada", "programada", "guardada", "revision"] as const;
type FlashKind = (typeof FLASH_VALUES)[number];

function parseFlash(value: string | string[] | undefined): FlashKind | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return FLASH_VALUES.includes(raw as FlashKind) ? (raw as FlashKind) : null;
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hecho?: string | string[] }>;
};

export default async function EditArticlePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const session = await auth();

  const [article, categories, authors, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        tags: true,
        revisions: { orderBy: { createdAt: "desc" }, take: 8, select: { id: true, createdAt: true, editorName: true } },
      },
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
        <div className="flex flex-wrap items-center gap-2">
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
          {session?.user && (
            <DeleteArticleButton id={article.id} title={article.title} />
          )}
        </div>
        {article.status === "SCHEDULED" && article.scheduledFor && (
          <p className="rounded-full bg-[var(--cartel-blue)]/10 px-3 py-1.5 text-xs font-bold text-[var(--cartel-blue)]">
            Programada ·{" "}
            {formatSchedule(article.scheduledFor)}
          </p>
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
          heroAlt: article.heroAlt ?? "",
          heroCredit: article.heroCredit ?? "",
          heroCaption: article.heroCaption ?? "",
          heroFocalX: article.heroFocalX,
          heroFocalY: article.heroFocalY,
          youtubeId: article.youtubeId ?? "",
          categoryId: article.categoryId,
          authorId: article.authorId,
          tagIds: article.tags.map((t) => t.tagId),
          scheduledFor: article.scheduledFor?.toISOString() ?? null,
          canPublish: session?.user ? canPublish(session.user.role) : false,
          updatedAt: article.updatedAt.toISOString(),
          flash: parseFlash(query.hecho),
          revisions: article.revisions.map((r) => ({
            id: r.id,
            createdAt: r.createdAt.toISOString(),
            editorName: r.editorName,
          })),
        }}
      />
    </div>
  );
}
