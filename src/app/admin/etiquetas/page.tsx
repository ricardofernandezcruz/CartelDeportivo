import { prisma } from "@/lib/prisma";
import { TagsManager } from "@/app/admin/etiquetas/tags-manager";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return <TagsManager tags={tags} />;
}
