import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos de uso",
  alternates: { canonical: "/terminos" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="font-heading text-4xl font-black uppercase">Términos de uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: 7 de octubre de 2026.</p>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Uso del sitio</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        {SITE_NAME} publica información deportiva de carácter periodístico. El acceso es libre. Queda prohibido
        usar el sitio para spam, scrapers abusivos o cualquier actividad ilegal.
      </p>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Contenido</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Textos, fotos, marcas y diseño son de {SITE_NAME} o de sus licenciantes. Puedes enlazar y citar de forma
        breve con crédito. La reproducción total o el uso comercial requieren autorización escrita.
      </p>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Comentarios y boletín</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Los comentarios son responsabilidad de quien los envía y pueden rechazarse si hay insultos, spam o datos
        ajenos. El boletín se puede cancelar pidiendo la baja por correo.
      </p>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Marcas de terceros</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Ligas, clubes y jugadores citados pertenecen a sus respectivos dueños. Su mención es informativa.
      </p>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Contacto</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Publicidad, licencias o reclamos:{" "}
        <a className="font-semibold text-[var(--cartel-blue)] underline" href="mailto:redaccion@carteldeportivo.com">
          redaccion@carteldeportivo.com
        </a>
        .
      </p>
    </div>
  );
}
