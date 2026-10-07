import { prisma } from "@/lib/prisma";

let ran = false;

/** Quita restos de demo (picsum, pravatar, rickroll, redes copiadas) en datos ya sembrados. */
export async function scrubDemoMediaOnce() {
  if (ran) return;
  ran = true;
  try {
    await prisma.article.updateMany({
      where: { heroImageUrl: { contains: "picsum.photos" } },
      data: { heroImageUrl: "/brand/placeholders/general.svg" },
    });
    await prisma.article.updateMany({
      where: { youtubeId: "dQw4w9WgXcQ" },
      data: { youtubeId: null },
    });
    await prisma.author.updateMany({
      where: { avatarUrl: { contains: "pravatar.cc" } },
      data: { avatarUrl: null },
    });
    await prisma.author.updateMany({
      where: { facebook: "https://www.facebook.com/" },
      data: { facebook: null },
    });
  } catch {
    ran = false;
  }
}
