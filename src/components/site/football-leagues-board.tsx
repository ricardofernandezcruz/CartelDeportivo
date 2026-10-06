"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, RefreshCw, Shield, Swords, Trophy } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard, type ArticleCardData } from "@/components/site/article-card";
import {
  FOOTBALL_LEAGUES,
  type FootballLeagueId,
  type FootballLeagueStandings,
  type FootballStandingRow,
  type FootballStandingsPayload,
} from "@/lib/football-leagues";

type Props = {
  standings: FootballStandingsPayload;
  news: Record<FootballLeagueId, ArticleCardData[]>;
  initialLeague?: FootballLeagueId;
};

const MAX_ROWS_COLLAPSED = 10;
const LEAGUE_IDS = new Set(FOOTBALL_LEAGUES.map((l) => l.id));

function isLeagueId(value: string): value is FootballLeagueId {
  return LEAGUE_IDS.has(value as FootballLeagueId);
}

export function FootballLeaguesBoard({ standings, news, initialLeague = "premier" }: Props) {
  const [active, setActive] = useState<FootballLeagueId>(
    isLeagueId(initialLeague) ? initialLeague : "premier",
  );
  const [expanded, setExpanded] = useState(false);

  const league = FOOTBALL_LEAGUES.find((l) => l.id === active)!;
  const table = standings[active];
  const articles = news[active] ?? [];

  const rows = useMemo(
    () => (expanded ? table.rows : table.rows.slice(0, MAX_ROWS_COLLAPSED)),
    [table.rows, expanded],
  );

  const highlights = useMemo(() => buildHighlights(table), [table]);
  const zones = useMemo(() => buildZoneLegend(table.rows), [table.rows]);
  const updatedLabel = formatUpdatedAt(table.updatedAt);

  return (
    <section className="space-y-6">
      <Card className="gap-0 overflow-hidden py-0 ring-[var(--cartel-blue)]/10">
        <div
          className="relative overflow-hidden px-5 py-6 text-white sm:px-7 sm:py-7"
          style={{
            backgroundImage: `linear-gradient(120deg, ${league.accent} 0%, var(--cartel-blue) 58%, var(--cartel-red) 120%)`,
          }}
        >
          <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/75">
                Ligas de Europa
              </p>
              <h2 className="mt-1 font-heading text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
                Tabla de posiciones
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/80">
                Elige una liga, mira la tabla en vivo y las noticias asociadas. Se refresca sola, como LIDOM.
              </p>
            </div>
            <Badge className="border-white/20 bg-white/15 text-white hover:bg-white/20">
              <RefreshCw className="size-3" />
              {table.source === "espn" ? "Actualizada en vivo" : "Datos de respaldo"}
            </Badge>
          </div>
        </div>

        <CardContent className="space-y-5 p-4 sm:p-6">
          <Tabs
            value={active}
            onValueChange={(value) => {
              if (typeof value === "string" && isLeagueId(value)) {
                setActive(value);
                setExpanded(false);
              }
            }}
            className="gap-4"
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 bg-muted/80 p-1.5 sm:grid-cols-4">
              {FOOTBALL_LEAGUES.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="h-auto min-h-14 min-w-0 flex-col items-start gap-0 overflow-hidden rounded-lg px-2.5 py-2.5 text-left whitespace-normal data-active:bg-[var(--cartel-blue)] data-active:text-white data-active:shadow-md sm:min-h-16 sm:px-3"
                >
                  <span className="flex w-full items-center gap-2">
                    <span className="text-base" aria-hidden>
                      {item.flag}
                    </span>
                    <span className="truncate font-heading text-xs font-black uppercase leading-tight sm:text-sm">
                      {item.name}
                    </span>
                  </span>
                  <span className="mt-0.5 pl-6 text-[10px] font-medium uppercase tracking-wider opacity-70 sm:text-[11px]">
                    {item.country}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl bg-muted/25 px-3 py-3 ring-1 ring-foreground/8"
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      <item.icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="truncate font-heading text-base font-black uppercase leading-tight">
                        {item.team}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="gap-0 overflow-hidden py-0">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-white sm:px-5"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${league.accent}, var(--cartel-blue))`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl" aria-hidden>
                      {league.flag}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-black uppercase leading-none tracking-tight">
                        {league.name}
                      </h3>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/75">
                        {league.country}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-white/80">
                    <p>{table.seasonLabel}</p>
                    {updatedLabel && <p className="normal-case tracking-normal text-white/65">{updatedLabel}</p>}
                  </div>
                </div>

                <Table className="min-w-[560px]">
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-14 pl-4 text-[10px] font-bold uppercase tracking-wider">#</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Equipo</TableHead>
                      <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">PJ</TableHead>
                      <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">G</TableHead>
                      <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">E</TableHead>
                      <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">P</TableHead>
                      <TableHead className="hidden text-center text-[10px] font-bold uppercase tracking-wider sm:table-cell">
                        GF
                      </TableHead>
                      <TableHead className="hidden text-center text-[10px] font-bold uppercase tracking-wider sm:table-cell">
                        GC
                      </TableHead>
                      <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">DIF</TableHead>
                      <TableHead className="pr-4 text-center text-[10px] font-bold uppercase tracking-wider">
                        PTS
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <StandingRow key={`${row.rank}-${row.abbr}`} row={row} />
                    ))}
                  </TableBody>
                </Table>

                {table.rows.length > MAX_ROWS_COLLAPSED && (
                  <div className="border-t border-border bg-muted/20 p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-xs font-bold uppercase tracking-wider text-[var(--cartel-blue)]"
                      onClick={() => setExpanded((v) => !v)}
                    >
                      {expanded ? "Ver menos" : `Ver tabla completa (${table.rows.length} equipos)`}
                    </Button>
                  </div>
                )}

                {zones.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border px-4 py-3 sm:px-5">
                    {zones.map((zone) => (
                      <span
                        key={zone.label}
                        className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                      >
                        <span
                          className="size-2.5 rounded-sm"
                          style={{ backgroundColor: zone.color }}
                          aria-hidden
                        />
                        {zone.label}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--cartel-red)]">
              Cobertura
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Noticias de {league.name}
            </h3>
          </div>
          {articles.length > 0 && (
            <Badge variant="outline" className="border-[var(--cartel-blue)] text-[var(--cartel-blue)]">
              {articles.length} {articles.length === 1 ? "nota" : "notas"}
            </Badge>
          )}
        </div>
        <Separator className="mb-5 bg-[var(--cartel-red)]" />

        {articles.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <p className="text-base font-semibold text-foreground">
              Todavía no hay notas de {league.name}
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              La tabla sí se actualiza en vivo. Cuando la redacción publique sobre esta liga, las
              notas aparecerán aquí automáticamente.
            </p>
            <Link
              href="/categoria/futbol"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cartel-blue)] hover:text-[var(--cartel-red)]"
            >
              Ver todo el fútbol
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function StandingRow({ row }: { row: FootballStandingRow }) {
  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="flex items-center gap-2">
          <span
            className="h-5 w-1 rounded-full"
            style={{ backgroundColor: row.zone?.color ?? "transparent" }}
            aria-hidden
          />
          <span className="w-4 text-center text-xs font-bold tabular-nums text-muted-foreground">
            {row.rank}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          {row.crest ? (
            <Image
              src={row.crest}
              alt=""
              width={22}
              height={22}
              className="size-[22px] shrink-0 object-contain"
              unoptimized
            />
          ) : (
            <span className="flex size-[22px] shrink-0 items-center justify-center rounded bg-muted text-[9px] font-bold text-muted-foreground">
              {row.abbr.slice(0, 3)}
            </span>
          )}
          <span className="truncate font-semibold">{row.shortName}</span>
        </div>
      </TableCell>
      <TableCell className="text-center tabular-nums text-muted-foreground">{row.played}</TableCell>
      <TableCell className="text-center tabular-nums">{row.win}</TableCell>
      <TableCell className="text-center tabular-nums text-muted-foreground">{row.draw}</TableCell>
      <TableCell className="text-center tabular-nums text-muted-foreground">{row.loss}</TableCell>
      <TableCell className="hidden text-center tabular-nums text-muted-foreground sm:table-cell">
        {row.gf}
      </TableCell>
      <TableCell className="hidden text-center tabular-nums text-muted-foreground sm:table-cell">
        {row.ga}
      </TableCell>
      <TableCell
        className={cn(
          "text-center font-semibold tabular-nums",
          row.gd > 0 && "text-emerald-600",
          row.gd < 0 && "text-[var(--cartel-red)]",
          row.gd === 0 && "text-muted-foreground",
        )}
      >
        {row.gd > 0 ? `+${row.gd}` : row.gd}
      </TableCell>
      <TableCell className="pr-4 text-center font-heading text-base font-black tabular-nums text-[var(--cartel-blue)]">
        {row.points}
      </TableCell>
    </TableRow>
  );
}

function formatUpdatedAt(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("es-DO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

function buildHighlights(table: FootballLeagueStandings) {
  const rows = table.rows;
  const leader = rows[0];
  const bestAttack = [...rows].sort((a, b) => b.gf - a.gf)[0];
  const bestDefense = [...rows].sort((a, b) => a.ga - b.ga)[0];

  return [
    {
      label: "Líder",
      team: leader?.shortName ?? "—",
      detail: leader ? `${leader.points} pts en ${leader.played} partidos` : "Sin datos",
      icon: Trophy,
      color: "var(--cartel-blue)",
    },
    {
      label: "Mejor ataque",
      team: bestAttack?.shortName ?? "—",
      detail: bestAttack ? `${bestAttack.gf} goles a favor` : "Sin datos",
      icon: Swords,
      color: "var(--cartel-red)",
    },
    {
      label: "Mejor defensa",
      team: bestDefense?.shortName ?? "—",
      detail: bestDefense ? `${bestDefense.ga} goles en contra` : "Sin datos",
      icon: Shield,
      color: "var(--cartel-dark)",
    },
  ];
}

function buildZoneLegend(rows: FootballStandingRow[]) {
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (row.zone && !seen.has(row.zone.label)) {
      seen.set(row.zone.label, row.zone.color);
    }
  }
  return [...seen].map(([label, color]) => ({ label, color }));
}
