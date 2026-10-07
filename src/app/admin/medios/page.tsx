import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaLibrary } from "@/app/admin/medios/media-library";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, session] = await Promise.all([searchParams, auth()]);
  const query = q?.trim() ?? "";
  const items = await prisma.mediaAsset.findMany({
    where: query
      ? {
          OR: [
            { alt: { contains: query, mode: "insensitive" } },
            { url: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase">Medios</h1>
        <p className="text-sm text-muted-foreground">
          Inventario de fotos subidas. Reutilízalas en el editor con “Biblioteca”.
        </p>
      </div>
      <MediaLibrary
        initialQ={query}
        canDelete={session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"}
        items={items.map((item) => ({
          id: item.id,
          url: item.url,
          alt: item.alt,
          mimeType: item.mimeType,
          width: item.width,
          height: item.height,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
