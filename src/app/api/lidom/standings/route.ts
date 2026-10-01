import { NextResponse } from "next/server";
import { getLidomStandings } from "@/lib/fetch-lidom-standings";

export const revalidate = 300;

export async function GET() {
  const data = await getLidomStandings();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
