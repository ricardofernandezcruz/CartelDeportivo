import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase">Etiquetas</h1>
        <p className="text-sm text-muted-foreground">Equipos, jugadores y temas para SEO y relacionados.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="px-3 py-1 text-sm">
            {tag.name}
            <span className="ml-2 text-[10px] uppercase text-muted-foreground">{tag.type}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
