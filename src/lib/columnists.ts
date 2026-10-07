import { prisma } from "@/lib/prisma";

const CARTEL_SOCIALS = {
  facebook: "https://www.facebook.com/",
  x: "https://x.com/grupopappyperez",
  tiktok: "https://www.tiktok.com/@pappyperez",
  instagram: "https://www.instagram.com/pappyperez/",
} as const;

export const COLUMNISTS = [
  {
    slug: "pappy-perez",
    name: "Pappy Pérez",
    column: "Béisbol",
    role: "Director del Grupo Pappy Pérez",
    bio: "Director del Grupo Pappy Pérez: reúne múltiples programas de TV, radio y redes sociales en la plataforma Cartel Deportivo. Es miembro y expresidente de la Asociación de Cronistas Deportivos de Santiago. También del Colegio Dominicano de Periodistas. Redactor deportivo de El Nacional en Santiago.",
    avatarUrl: "/brand/columnists/pappy-perez.png",
    sortOrder: 1,
    socials: {
      facebook: "https://www.facebook.com/pappyperez",
      x: "https://x.com/grupopappyperez",
      tiktok: "https://www.tiktok.com/@pappyperez",
      instagram: "https://www.instagram.com/pappyperez/",
    },
  },
  {
    slug: "tuto-tavarez",
    name: "Tuto Tavárez",
    column: "Pica y se Extiende",
    role: "Redactor deportivo y productor de TV",
    bio: "Redactor deportivo de La Información y productor de TV. Expresidente de la ACDS y autor de los libros “Béisbol en voz Populi” y “Santiagueros en Grandes Ligas”. Ganador en múltiples ocasiones del premio Cronista del Año en Prensa Escrita, que otorga la Asociación de Cronistas Deportivos de Santiago.",
    avatarUrl: "/brand/columnists/tuto-tavarez.png",
    sortOrder: 2,
    socials: { ...CARTEL_SOCIALS },
  },
  {
    slug: "domingo-hernandez",
    name: "Domingo Hernández",
    column: "Entre Cuerdas",
    role: "Editor deportivo",
    bio: "Editor deportivo del periódico La Información y analista experto de boxeo. Egresado de la carrera de Comunicación Social de UTESA, productor de TV y miembro de la Asociación de Cronistas Deportivos de Santiago (ACDS).",
    avatarUrl: "/brand/columnists/domingo-hernandez.png",
    sortOrder: 3,
    socials: { ...CARTEL_SOCIALS },
  },
  {
    slug: "rafael-baldayac",
    name: "Rafael Baldayac",
    column: "Hechos históricos deportivos",
    role: "Periodista e historiador deportivo",
    bio: "Periodista, historiador deportivo y relacionista público. Miembro del CDP, de la ACDS y del staff de prensa de las Águilas Cibaeñas.",
    avatarUrl: "/brand/columnists/rafael-baldayac.png",
    sortOrder: 4,
    socials: { ...CARTEL_SOCIALS },
  },
] as const;

export type ColumnistMeta = (typeof COLUMNISTS)[number];

export type ColumnistLatestArticle = {
  title: string;
  slug: string;
};

export type ColumnistSocials = {
  facebook?: string;
  x?: string;
  tiktok?: string;
  instagram?: string;
};

export type ColumnistCardData = {
  id?: string;
  slug: string;
  name: string;
  column: string;
  role: string;
  bio: string;
  avatarUrl: string;
  latestArticle: ColumnistLatestArticle | null;
  socials: ColumnistSocials;
};

const COLUMNIST_SLUGS = COLUMNISTS.map((c) => c.slug);

function socialsFromRow(row: {
  facebook?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  instagram?: string | null;
}): ColumnistSocials {
  return {
    facebook: row.facebook || undefined,
    x: row.twitter || undefined,
    tiktok: row.tiktok || undefined,
    instagram: row.instagram || undefined,
  };
}

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
    COLUMNISTS.filter((c) => !have.has(c.slug)).map((c, index) =>
      prisma.author.upsert({
        where: { slug: c.slug },
        create: {
          name: c.name,
          slug: c.slug,
          bio: c.bio,
          avatarUrl: c.avatarUrl,
          column: c.column,
          role: c.role,
          featured: true,
          sortOrder: c.sortOrder ?? index + 1,
          facebook: c.socials.facebook,
          twitter: c.socials.x,
          tiktok: c.socials.tiktok,
          instagram: c.socials.instagram,
        },
        update: {},
      }),
    ),
  );
}

export async function getColumnists(): Promise<ColumnistCardData[]> {
  try {
    await ensureColumnists();
    const rows = await prisma.author.findMany({
      where: { featured: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        articles: {
          where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
          orderBy: { publishedAt: "desc" },
          take: 1,
          select: { title: true, slug: true },
        },
      },
    });

    if (rows.length) {
      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        column: row.column || "Opinión",
        role: row.role || "Redacción",
        bio: row.bio || "",
        avatarUrl: row.avatarUrl || "",
        latestArticle: row.articles[0] ?? null,
        socials: socialsFromRow(row),
      }));
    }

    return COLUMNISTS.map((meta) => ({ ...meta, latestArticle: null }));
  } catch {
    return COLUMNISTS.map((meta) => ({ ...meta, latestArticle: null }));
  }
}

export async function getAuthorBySlug(slug: string) {
  const meta = getColumnistMeta(slug);
  try {
    await ensureColumnists();
    const author = await prisma.author.findUnique({ where: { slug } });
    if (!author && !meta) return null;

    if (author) {
      return {
        id: author.id,
        slug: author.slug,
        name: author.name,
        bio: author.bio,
        avatarUrl: author.avatarUrl,
        column: author.column || meta?.column || "Opinión",
        role: author.role || meta?.role || "Redacción",
        isColumnist: author.featured,
        socials: socialsFromRow(author),
      };
    }

    return {
      id: undefined,
      slug: meta!.slug,
      name: meta!.name,
      bio: meta!.bio,
      avatarUrl: meta!.avatarUrl,
      column: meta!.column,
      role: meta!.role,
      isColumnist: true,
      socials: meta!.socials,
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
      socials: meta.socials,
    };
  }
}
