import { prisma } from "@/lib/prisma";
import { publicAvatarUrl } from "@/lib/media";
import { CARTEL_SOCIAL_URLS } from "@/lib/site-socials";

export type ColumnistSocials = {
  facebook?: string;
  x?: string;
  tiktok?: string;
  instagram?: string;
};

function isBareSocial(url?: string | null) {
  if (!url) return true;
  const u = url.trim().replace(/\/+$/, "");
  return (
    u === "https://www.facebook.com" ||
    u === "https://facebook.com" ||
    u === "https://x.com" ||
    u === "https://twitter.com" ||
    u === "https://www.instagram.com" ||
    u === "https://instagram.com" ||
    u === "https://www.tiktok.com" ||
    u === "https://tiktok.com"
  );
}

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
    socials: {
      facebook: CARTEL_SOCIAL_URLS.facebook,
      x: "https://x.com/tutotavarez",
      tiktok: CARTEL_SOCIAL_URLS.tiktok,
      instagram: CARTEL_SOCIAL_URLS.instagram,
    },
  },
  {
    slug: "domingo-hernandez",
    name: "Domingo Hernández",
    column: "Entre Cuerdas",
    role: "Editor deportivo",
    bio: "Editor deportivo del periódico La Información y analista experto de boxeo. Egresado de la carrera de Comunicación Social de UTESA, productor de TV y miembro de la Asociación de Cronistas Deportivos de Santiago (ACDS).",
    avatarUrl: "/brand/columnists/domingo-hernandez.png",
    sortOrder: 3,
    socials: { ...CARTEL_SOCIAL_URLS },
  },
  {
    slug: "rafael-baldayac",
    name: "Rafael Baldayac",
    column: "Hechos históricos deportivos",
    role: "Periodista e historiador deportivo",
    bio: "Periodista, historiador deportivo y relacionista público. Miembro del CDP, de la ACDS y del staff de prensa de las Águilas Cibaeñas.",
    avatarUrl: "/brand/columnists/rafael-baldayac.png",
    sortOrder: 4,
    socials: {
      facebook: CARTEL_SOCIAL_URLS.facebook,
      x: CARTEL_SOCIAL_URLS.x,
      tiktok: CARTEL_SOCIAL_URLS.tiktok,
      instagram: "https://www.instagram.com/rafael_baldayac/",
    },
  },
] as const;

export type ColumnistMeta = (typeof COLUMNISTS)[number];

export type ColumnistLatestArticle = {
  title: string;
  slug: string;
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
    facebook: isBareSocial(row.facebook) ? undefined : row.facebook || undefined,
    x: isBareSocial(row.twitter) ? undefined : row.twitter || undefined,
    tiktok: isBareSocial(row.tiktok) ? undefined : row.tiktok || undefined,
    instagram: isBareSocial(row.instagram) ? undefined : row.instagram || undefined,
  };
}

function mergeSocials(...parts: Array<ColumnistSocials | undefined>): ColumnistSocials {
  const merged: ColumnistSocials = { ...CARTEL_SOCIAL_URLS };
  for (const part of parts) {
    if (!part) continue;
    if (part.facebook) merged.facebook = part.facebook;
    if (part.x) merged.x = part.x;
    if (part.tiktok) merged.tiktok = part.tiktok;
    if (part.instagram) merged.instagram = part.instagram;
  }
  return merged;
}

export function getColumnistMeta(slug: string) {
  return COLUMNISTS.find((c) => c.slug === slug) ?? null;
}

export async function ensureColumnists() {
  const existing = await prisma.author.findMany({
    where: { slug: { in: [...COLUMNIST_SLUGS] } },
    select: {
      slug: true,
      facebook: true,
      twitter: true,
      tiktok: true,
      instagram: true,
    },
  });
  const bySlug = new Map(existing.map((a) => [a.slug, a]));

  await Promise.all(
    COLUMNISTS.map((c, index) => {
      const socials = mergeSocials(c.socials);
      const row = bySlug.get(c.slug);
      return prisma.author.upsert({
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
          facebook: socials.facebook,
          twitter: socials.x,
          tiktok: socials.tiktok,
          instagram: socials.instagram,
        },
        update: {
          facebook: isBareSocial(row?.facebook) ? socials.facebook : undefined,
          twitter: isBareSocial(row?.twitter) ? socials.x : undefined,
          tiktok: isBareSocial(row?.tiktok) ? socials.tiktok : undefined,
          instagram: isBareSocial(row?.instagram) ? socials.instagram : undefined,
        },
      });
    }),
  );
}

export async function getColumnists(): Promise<ColumnistCardData[]> {
  try {
    const { scrubDemoMediaOnce } = await import("@/lib/scrub-demo-media");
    await scrubDemoMediaOnce();
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
        avatarUrl:
          publicAvatarUrl(row.avatarUrl) || getColumnistMeta(row.slug)?.avatarUrl || "",
        latestArticle: row.articles[0] ?? null,
        socials: mergeSocials(getColumnistMeta(row.slug)?.socials, socialsFromRow(row)),
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
        avatarUrl: publicAvatarUrl(author.avatarUrl) || meta?.avatarUrl || null,
        column: author.column || meta?.column || "Opinión",
        role: author.role || meta?.role || "Redacción",
        isColumnist: author.featured,
        socials: mergeSocials(meta?.socials, socialsFromRow(author)),
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
