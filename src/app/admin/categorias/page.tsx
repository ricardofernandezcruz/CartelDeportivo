import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase">Categorías</h1>
        <p className="text-sm text-muted-foreground">
          CRUD completo en la siguiente iteración; en demo vienen precargadas del sitio actual.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{cat.name}</CardTitle>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>/{cat.slug}</p>
              <Badge variant="secondary">{cat._count.articles} noticias</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
