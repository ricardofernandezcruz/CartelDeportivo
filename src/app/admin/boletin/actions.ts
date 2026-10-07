"use server";

import { revalidatePath } from "next/cache";
import { auth, canPublish } from "@/lib/auth";
import { getPublishedArticles } from "@/lib/articles";
import { digestEmailHtml, mailConfigured, sendEmailBatch } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export async function deleteSubscriberAction(id: string) {
  const session = await auth();
  if (!session?.user || !canPublish(session.user.role)) {
    return { ok: false as const, error: "Sin permiso" };
  }
  await prisma.newsletterSubscriber.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/boletin");
  return { ok: true as const };
}

export async function sendDigestAction() {
  const session = await auth();
  if (!session?.user || !canPublish(session.user.role)) {
    return { ok: false as const, error: "Sin permiso" };
  }
  if (!mailConfigured()) {
    return { ok: false as const, error: "Falta RESEND_API_KEY en el entorno." };
  }

  const [articles, subs] = await Promise.all([
    getPublishedArticles(5),
    prisma.newsletterSubscriber.findMany({ select: { email: true } }),
  ]);
  if (!articles.length) return { ok: false as const, error: "No hay noticias publicadas." };
  if (!subs.length) return { ok: false as const, error: "No hay suscriptores." };

  const html = digestEmailHtml(articles);
  const result = await sendEmailBatch(
    subs.map((s) => ({
      to: s.email,
      subject: "Titulares Cartel Deportivo",
      html,
    })),
  );
  if (!result.ok) return { ok: false as const, error: "Resend no pudo enviar el lote." };
  return { ok: true as const, sent: result.sent };
}
