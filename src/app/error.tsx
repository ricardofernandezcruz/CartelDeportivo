"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    void import("@/lib/sentry").then(({ reportError }) => reportError(error, { extra: { digest: error.digest } }));
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--cartel-red)]">Error</p>
      <h1 className="mt-3 font-heading text-3xl font-black uppercase">Algo salió mal</h1>
      <p className="mt-3 text-muted-foreground">Recarga o vuelve a portada. Si sigue, avísanos a redacción.</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[var(--cartel-red)] px-5 py-2.5 text-sm font-bold text-white"
        >
          Reintentar
        </button>
        <Link href="/" className="rounded-full border border-border px-5 py-2.5 text-sm font-bold">
          Portada
        </Link>
      </div>
    </div>
  );
}
