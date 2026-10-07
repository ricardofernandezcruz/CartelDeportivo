import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/app/admin/categorias/categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return <CategoriesManager categories={categories} />;
}
