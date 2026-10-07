import { prisma } from "@/lib/prisma";

export const COLUMNISTS = [
  {
    slug: "pappy-perez",
    name: "Pappy Pérez",
    column: "Béisbol",
    role: "Director del Grupo Pappy Pérez",
    bio: "Director del Grupo Pappy Pérez: reúne múltiples programas de TV, radio y redes sociales en la plataforma Cartel Deportivo. Es miembro y expresidente de la Asociación de Cronistas Deportivos de Santiago. También del Colegio Dominicano de Periodistas. Redactor deportivo de El Nacional en Santiago.",
    avatarUrl: "/brand/columnists/pappy-perez.png",
  },
  {
    slug: "tuto-tavarez",
    name: "Tuto Tavárez",
    column: "Pica y se Extiende",
    role: "Redactor deportivo y productor de TV",
    bio: "Redactor deportivo de La Información y productor de TV. Expresidente de la ACDS y autor de los libros “Béisbol en voz Populi” y “Santiagueros en Grandes Ligas”. Ganador en múltiples ocasiones del premio Cronista del Año en Prensa Escrita, que otorga la Asociación de Cronistas Deportivos de Santiago.",
    avatarUrl: "/brand/columnists/tuto-tavarez.png",
  },
  {
    slug: "domingo-hernandez",
    name: "Domingo Hernández",
    column: "Entre Cuerdas",
    role: "Editor deportivo",
    bio: "Editor deportivo del periódico La Información y analista experto de boxeo. Egresado de la carrera de Comunicación Social de UTESA, productor de TV y miembro de la Asociación de Cronistas Deportivos de Santiago (ACDS).",
    avatarUrl: "/brand/columnists/domingo-hernandez.png",
  },
  {
    slug: "rafael-baldayac",
    name: "Rafael Baldayac",
    column: "Hechos históricos deportivos",
    role: "Periodista e historiador deportivo",
    bio: "Periodista, historiador deportivo y relacionista público. Miembro del CDP, de la ACDS y del staff de prensa de las Águilas Cibaeñas.",
    avatarUrl: "/brand/columnists/rafael-baldayac.png",
  },
] as const;

export type ColumnistMeta = (typeof COLUMNISTS)[number];

export type ColumnistCardData = {
  id?: string;
  slug: string;
  name: string;
  column: string;
  role: string;
  bio: string;
  avatarUrl: string;
};

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
        name: meta.name,
        bio: meta.bio,
        avatarUrl: meta.avatarUrl,
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
      name: meta?.name ?? author!.name,
      bio: meta?.bio || author?.bio || null,
      avatarUrl: meta?.avatarUrl || author?.avatarUrl || null,
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
