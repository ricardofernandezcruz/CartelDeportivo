import { NextResponse } from "next/server";
import { getAllFootballStandings, getFootballLeagueStandings } from "@/lib/fetch-football-standings";
import { FOOTBALL_LEAGUES, type FootballLeagueId } from "@/lib/football-leagues";

export const revalidate = 300;

export async function GET(req: Request) {
  const liga = new URL(req.url).searchParams.get("liga");

  const headers = {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  };

  if (liga) {
    const known = FOOTBALL_LEAGUES.find((l) => l.id === liga);
    if (!known) {
      return NextResponse.json(
        { error: "Liga desconocida", ligas: FOOTBALL_LEAGUES.map((l) => l.id) },
        { status: 400 },
      );
    }
    const data = await getFootballLeagueStandings(liga as FootballLeagueId);
    return NextResponse.json(data, { headers });
  }

  const data = await getAllFootballStandings();
  return NextResponse.json(data, { headers });
}
