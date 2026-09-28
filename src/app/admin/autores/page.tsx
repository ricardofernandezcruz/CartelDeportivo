import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase">Autores</h1>
        <p className="text-sm text-muted-foreground">Firmas y perfiles de la redacción y colaboradores.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {authors.map((author) => (
          <Card key={author.id}>
            <CardContent className="flex items-center gap-4 pt-6">
              <Avatar className="h-12 w-12">
                {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
                <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{author.name}</p>
                <p className="text-sm text-muted-foreground">{author._count.articles} noticias</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
