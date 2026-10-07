"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error(error);
  void import("@/lib/sentry").then(({ reportError }) => reportError(error, { extra: { digest: error.digest } }));
  return (
    <html lang="es-DO">
      <body className="flex min-h-screen flex-col items-center justify-center px-4 text-center font-sans">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C8102E]">Error</p>
        <h1 className="mt-3 text-3xl font-black uppercase">El sitio no pudo cargar</h1>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-[#C8102E] px-5 py-2.5 text-sm font-bold text-white"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
