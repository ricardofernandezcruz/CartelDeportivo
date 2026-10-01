"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LIDOM_PHASES,
  type LidomPhase,
  type LidomStandingRow,
  type LidomStandingsPayload,
} from "@/lib/lidom-standings";
import { cn } from "@/lib/utils";

function TeamMark({ row }: { row: LidomStandingRow }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-black shadow-sm ring-1 ring-black/10"
      style={{ backgroundColor: row.color, color: row.accent }}
      aria-hidden
    >
      {row.abbr}
    </span>
  );
}

function StandingsTable({ rows, compact }: { rows: LidomStandingRow[]; compact?: boolean }) {
  if (!rows.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Sin datos para esta fase todavía.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <th className="pb-2 pr-2 font-bold">Equipo</th>
            <th className="px-1.5 pb-2 text-center font-bold">JJ</th>
            <th className="px-1.5 pb-2 text-center font-bold">G</th>
            <th className="px-1.5 pb-2 text-center font-bold">P</th>
            <th className="px-1.5 pb-2 text-center font-bold">PCT</th>
            <th className="px-1.5 pb-2 text-center font-bold">DIF</th>
            {!compact && <th className="pb-2 pl-1.5 text-center font-bold">Racha</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.shortName} className="border-t border-[var(--cartel-blue)]/10">
              <td className="py-2.5 pr-2">
                <div className="flex items-center gap-2">
                  {row.eliminated && (
                    <span className="text-xs font-black text-[var(--cartel-red)]" title="Eliminado">
                      x
                    </span>
                  )}
                  <TeamMark row={row} />
                  <span className="text-xs font-black uppercase tracking-wide text-foreground sm:text-[13px]">
                    {row.shortName}
                  </span>
                </div>
              </td>
              <td className="px-1.5 py-2.5 text-center text-xs tabular-nums text-foreground/80">{row.jj}</td>
              <td className="px-1.5 py-2.5 text-center text-xs font-semibold tabular-nums">{row.g}</td>
              <td className="px-1.5 py-2.5 text-center text-xs tabular-nums text-foreground/80">{row.p}</td>
              <td className="px-1.5 py-2.5 text-center text-xs tabular-nums text-foreground/80">{row.pct}</td>
              <td className="px-1.5 py-2.5 text-center text-xs font-semibold tabular-nums text-[var(--cartel-blue)]">
                {row.dif}
              </td>
              {!compact && (
                <td className="py-2.5 pl-1.5 text-center text-xs font-semibold tabular-nums text-foreground/80">
                  {row.racha}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function defaultPhase(data: LidomStandingsPayload): LidomPhase {
  if (data.phases.final.length) return "final";
  if (data.phases["round-robin"].length) return "round-robin";
  return "regular";
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

export function LidomStandings({
  data,
  compact = true,
  showExpandLink = true,
}: {
  data: LidomStandingsPayload;
  compact?: boolean;
  showExpandLink?: boolean;
}) {
  const [phase, setPhase] = useState<LidomPhase>(() => defaultPhase(data));
  const rows = data.phases[phase];
  const hasEliminated = rows.some((r) => r.eliminated);
  const updatedLabel = formatUpdatedAt(data.updatedAt);

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--cartel-blue)]/15 bg-white shadow-sm dark:bg-card">
      <div className="border-b border-[var(--cartel-blue)]/10 px-4 pb-3 pt-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cartel-red)]">LIDOM</p>
            <h3 className="font-heading text-lg font-black uppercase tracking-tight text-foreground/80 sm:text-xl">
              Las Posiciones
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">{data.seasonLabel}</p>
            {updatedLabel && (
              <p className="text-[10px] text-muted-foreground/80">
                {data.source === "mlb" ? "MLB · " : "Demo · "}
                {updatedLabel}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-muted/70 p-1">
          {LIDOM_PHASES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPhase(item.id)}
              className={cn(
                "rounded-md px-1.5 py-2 text-center text-[9px] font-black uppercase leading-tight tracking-wide transition sm:text-[10px]",
                phase === item.id
                  ? "bg-[var(--cartel-blue)] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-white/80 hover:text-[var(--cartel-blue)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 sm:px-5">
        <StandingsTable rows={rows} compact={compact} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--cartel-blue)]/10 px-4 py-3 sm:px-5">
        {hasEliminated ? (
          <p className="text-[11px] text-muted-foreground">
            <span className="font-bold text-[var(--cartel-red)]">x)</span> = Equipos descalificados
          </p>
        ) : (
          <span />
        )}
        {showExpandLink && (
          <Link
            href="/posiciones"
            className="text-[11px] font-black uppercase tracking-wide text-foreground/75 hover:text-[var(--cartel-blue)]"
          >
            + Ampliar Posiciones »
          </Link>
        )}
      </div>
    </section>
  );
}
