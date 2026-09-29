import { NextResponse } from "next/server";
import { disconnectSeedPrisma, seedDatabase } from "@/lib/seed-demo";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Semilla one-shot para demos en Vercel (si tu PC no alcanza Neon).
 * POST /api/demo/seed
 * Header: Authorization: Bearer <SEED_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Configura SEED_SECRET en Vercel para usar este endpoint" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json({
      ok: true,
      ...result,
      login: "editor@carteldeportivo.com / demo1234",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error en seed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  } finally {
    await disconnectSeedPrisma();
  }
}
