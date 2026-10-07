import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sendEmail, welcomeEmailHtml } from "@/lib/mail";

const bodySchema = z.object({
  email: z.string().email("Correo inválido").max(180),
});

export async function POST(request: Request) {
  const limited = rateLimit(`newsletter:${clientIpFromHeaders(request.headers)}`, { max: 6, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Demasiados intentos. Prueba más tarde." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Correo inválido" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  try {
    await prisma.newsletterSubscriber.create({ data: { email } });
    await sendEmail({
      to: email,
      subject: "Bienvenido al boletín de Cartel Deportivo",
      html: welcomeEmailHtml(email),
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const limited = rateLimit(`newsletter-unsub:${clientIpFromHeaders(request.headers)}`, {
    max: 10,
    windowMs: 60 * 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Demasiados intentos. Prueba más tarde." }, { status: 429 });
  }

  const url = new URL(request.url);
  const email = String(url.searchParams.get("email") ?? "").trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }
  await prisma.newsletterSubscriber.deleteMany({ where: { email: parsed.data } });
  return NextResponse.json({ ok: true });
}
