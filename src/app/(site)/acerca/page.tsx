import { BrandLogo } from "@/components/site/brand-logo";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <BrandLogo />
      <h1 className="mt-8 font-heading text-4xl font-black uppercase">Sobre nosotros</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Cartel Deportivo es el portal de referencia para el deporte dominicano y las Grandes Ligas,
        con cobertura desde Santiago de los Caballeros bajo la dirección de Pappy Pérez.
      </p>
    </div>
  );
}
