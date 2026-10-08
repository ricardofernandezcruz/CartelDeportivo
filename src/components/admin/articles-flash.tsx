"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatSchedule } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ArticlesFlashKind = "publicada" | "programada";

export function ArticlesFlash({
  hecho,
  slug,
  scheduledFor,
  estado,
}: {
  hecho: ArticlesFlashKind | null;
  slug?: string | null;
  scheduledFor?: string | null;
  estado?: string | null;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<{
    hecho: ArticlesFlashKind;
    slug: string | null;
    scheduledFor: string | null;
  } | null>(() => (hecho ? { hecho, slug: slug ?? null, scheduledFor: scheduledFor ?? null } : null));

  useEffect(() => {
    if (!notice) return;
    const qs = estado ? `?estado=${estado}` : "";
    router.replace(`/admin/articulos${qs}`, { scroll: false });
  }, [notice, estado, router]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 9000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;

  const message =
    notice.hecho === "publicada"
      ? "Publicada. Ya está en el sitio y en esta lista."
      : notice.scheduledFor
        ? `Programada. Se publicará el ${formatSchedule(new Date(notice.scheduledFor))}.`
        : "Programada. Se publicará sola a la hora indicada.";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-800 shadow-sm dark:text-emerald-300"
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="leading-relaxed">{message}</p>
        {notice.hecho === "publicada" && notice.slug ? (
          <Link
            href={`/noticia/${notice.slug}`}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "outline", size: "xs" }),
              "mt-2 border-emerald-600/30 bg-white/60 text-emerald-800 hover:bg-white dark:bg-emerald-950/40 dark:text-emerald-200",
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver en el sitio
          </Link>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setNotice(null)}
        className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100"
        aria-label="Cerrar aviso"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
