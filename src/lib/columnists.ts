import { prisma } from "@/lib/prisma";

export const COLUMNISTS = [
  {
    slug: "pappy-perez",
    name: "Pappy Pérez",
    column: "Béisbol",
    role: "Director y cronista deportivo",
    bio: "Director de Cartel Deportivo. Cronista desde Santiago de los Caballeros; cubre LIDOM, Grandes Ligas y la actualidad del deporte dominicano.",
    avatarUrl: "/brand/columnists/pappy-perez.png",
  },
  {
    slug: "tuto-tavarez",
    name: "Tuto Tavárez",
    column: "Pica y se Extiende",
    role: "Columnista",
    bio: "Autor de la columna Pica y se Extiende. Cubre LIDOM, boxeo y las ligas del Cibao con un estilo directo y de opinión.",
    avatarUrl: "/brand/columnists/tuto-tavarez.png",
  },
  {
    slug: "domingo-hernandez",
    name: "Domingo Hernández",
    column: "Entre Cuerdas",
    role: "Columnista",
    bio: "Firma de Entre Cuerdas. Opinión y análisis de boxeo, con mirada a los gyms, las veladas y los protagonistas del ring dominicano.",
    avatarUrl: "/brand/columnists/domingo-hernandez.png",
  },
  {
    slug: "rafael-baldayac",
    name: "Rafael Baldayac",
    column: "Hechos históricos deportivos",
    role: "Columnista",
    bio: "Autor de Hechos históricos deportivos. Recupera efemérides, anécdotas y memoria del deporte mundial y dominicano.",
    avatarUrl: "/brand/columnists/rafael-baldayac.jpg",
  },
] as const;

export type ColumnistMeta = (typeof COLUMNISTS)[number];

const COLUMNIST_SLUGS = COLUMNISTS.map((c) => c.slug);

export function getColumnistMeta(slug: string) {
  return COLUMNISTS.find((c) => c.slug === slug) ?? null;
}

export async function ensureColumnists() {
  const existing = await prisma.author.findMany({
    where: { slug: { in: [...COLUMNIST_SLUGS] } },
    select: { slug: true },
  });
  const have = new Set(existing.map((a) => a.slug));
  if (have.size === COLUMNISTS.length) return;

  await Promise.all(
    COLUMNISTS.filter((c) => !have.has(c.slug)).map((c) =>
      prisma.author.upsert({
        where: { slug: c.slug },
        create: { name: c.name, slug: c.slug, bio: c.bio, avatarUrl: c.avatarUrl },
        update: { name: c.name, bio: c.bio, avatarUrl: c.avatarUrl },
      }),
    ),
  );
}

export type ColumnistCardData = ColumnistMeta & {
  id?: string;
};

export async function getColumnists(): Promise<ColumnistCardData[]> {
  try {
    await ensureColumnists();
    const rows = await prisma.author.findMany({
      where: { slug: { in: [...COLUMNIST_SLUGS] } },
    });
    const bySlug = new Map(rows.map((r) => [r.slug, r]));

    return COLUMNISTS.map((meta) => {
      const row = bySlug.get(meta.slug);
      return {
        ...meta,
        id: row?.id,
        name: row?.name ?? meta.name,
        bio: row?.bio || meta.bio,
        avatarUrl: row?.avatarUrl || meta.avatarUrl,
      };
    });
  } catch {
    return COLUMNISTS.map((meta) => ({ ...meta }));
  }
}

export async function getAuthorBySlug(slug: string) {
  const meta = getColumnistMeta(slug);
  try {
    await ensureColumnists();
    const author = await prisma.author.findUnique({ where: { slug } });
    if (!author && !meta) return null;

    return {
      id: author?.id,
      slug: author?.slug ?? meta!.slug,
      name: author?.name ?? meta!.name,
      bio: author?.bio || meta?.bio || null,
      avatarUrl: author?.avatarUrl || meta?.avatarUrl || null,
      column: meta?.column ?? "Opinión",
      role: meta?.role ?? "Redacción",
      isColumnist: Boolean(meta),
    };
  } catch {
    if (!meta) return null;
    return {
      id: undefined,
      slug: meta.slug,
      name: meta.name,
      bio: meta.bio,
      avatarUrl: meta.avatarUrl,
      column: meta.column,
      role: meta.role,
      isColumnist: true,
    };
  }
}
