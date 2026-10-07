import { prisma } from "@/lib/prisma";
import { AuthorsManager } from "@/app/admin/autores/authors-manager";

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { articles: true } } },
  });

  return <AuthorsManager authors={authors} />;
}
