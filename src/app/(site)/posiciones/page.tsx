import type { Metadata } from "next";
import { LidomStandings } from "@/components/site/lidom-standings";
import { getLidomStandings } from "@/lib/fetch-lidom-standings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Posiciones LIDOM",
  description: "Tabla de posiciones en vivo de la Liga de Béisbol Profesional de la República Dominicana.",
};

export default async function PosicionesPage() {
  const data = await getLidomStandings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6 lg:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--cartel-red)]">Béisbol · LIDOM</p>
      <h1 className="mt-2 font-heading text-4xl font-black uppercase tracking-tight text-[var(--cartel-blue)] sm:text-5xl">
        Posiciones
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Datos en vivo desde la API de MLB (liga 131). Se refrescan cada ~5 minutos: serie regular, round robin y
        serie final.
      </p>
      <div className="mt-8">
        <LidomStandings data={data} compact={false} showExpandLink={false} />
      </div>
    </div>
  );
}
