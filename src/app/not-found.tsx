import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--cartel-red)]">Error 404</p>
      <h1 className="mt-3 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
        Esta página no existe
      </h1>
      <p className="mt-4 text-muted-foreground">
        El enlace está roto o la nota ya no está publicada. Vuelve a portada o busca otra noticia.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[var(--cartel-red)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--cartel-red)]/90"
        >
          Ir a portada
        </Link>
        <Link
          href="/buscar"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-bold hover:border-[var(--cartel-blue)]"
        >
          Buscar
        </Link>
      </div>
    </div>
  );
}
