import { NextResponse } from "next/server";
import { publishDueArticles } from "@/lib/publish-scheduled";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request) {
  // Vercel Cron envía este header en invocaciones programadas
  if (req.headers.get("x-vercel-cron") === "1") return true;

  const secret = process.env.CRON_SECRET || process.env.SEED_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = new URL(req.url).searchParams.get("secret");
  return bearer === secret || query === secret;
}

/** Vercel Cron + llamada manual: publica noticias programadas vencidas. */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await publishDueArticles();
    return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
