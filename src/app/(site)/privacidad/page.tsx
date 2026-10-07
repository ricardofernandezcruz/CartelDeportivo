import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="font-heading text-4xl font-black uppercase">Política de privacidad</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: 7 de octubre de 2026.</p>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Quiénes somos</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        {SITE_NAME} es un medio deportivo con sede en Santiago de los Caballeros, República Dominicana.
        Responsable: redacción@carteldeportivo.com.
      </p>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Qué datos guardamos</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
        <li>Correo del boletín, si te suscribes.</li>
        <li>Nombre y texto de comentarios que envías a una nota (quedan en revisión antes de publicarse).</li>
        <li>Datos técnicos mínimos del servidor (IP, navegador) para seguridad y medición de audiencia.</li>
        <li>Cookies propias de sesión si entras al panel de redacción.</li>
      </ul>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Para qué los usamos</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Operar el sitio, enviar el boletín, moderar comentarios, medir lecturas y proteger el panel. No vendemos
        listas de correos ni perfiles.
      </p>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Terceros</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Podemos usar alojamiento (Vercel), base de datos, analítica (Plausible o Google Analytics si está
        configurada) y publicidad (Google Ad Manager) cuando haya contrato activo. Esos proveedores tratan datos
        según sus propias políticas.
      </p>

      <h2 className="mt-8 font-heading text-xl font-black uppercase">Tus derechos</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Para acceder, corregir o borrar un dato (incluido el correo del boletín), escribe a{" "}
        <a className="font-semibold text-[var(--cartel-blue)] underline" href="mailto:redaccion@carteldeportivo.com">
          redaccion@carteldeportivo.com
        </a>
        .
      </p>
    </div>
  );
}
