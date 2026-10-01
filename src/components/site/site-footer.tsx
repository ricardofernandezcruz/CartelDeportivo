import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";
import { SocialLinks } from "@/components/site/social-icons";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-4 border-[var(--cartel-red)] bg-[var(--cartel-blue)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="flex flex-col items-center gap-4 border-b border-white/20 pb-8">
          <BrandLogo className="rounded-lg bg-white px-4 py-2" variant="full" />
          <p className="max-w-2xl text-center text-sm leading-relaxed text-white/90">
            CARTEL DEPORTIVO es editado y producido desde Santiago de los Caballeros, República Dominicana,
            y dirigido por cronista deportivo PAPPY PEREZ.
          </p>
        </div>

        <div className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white">Secciones</p>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              {["beisbol", "baloncesto", "futbol", "boxeo", "motor"].map((slug) => (
                <li key={slug}>
                  <Link href={`/categoria/${slug}`} className="hover:text-white hover:underline">
                    {slug
                      .replace("beisbol", "Béisbol")
                      .replace("futbol", "Fútbol")
                      .replace(/^./, (c) => c.toUpperCase())}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/posiciones" className="hover:text-white hover:underline">
                  Posiciones LIDOM
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white">Cartel</p>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              <li>
                <Link href="/acerca" className="hover:underline">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Publicidad
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:underline">
                  Acceso
                </Link>
              </li>
            </ul>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-black uppercase tracking-widest text-white">Síguenos</p>
            <SocialLinks variant="dark" className="mt-3" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-6 text-xs text-white/70">
          <p>© {new Date().getFullYear()} Cartel Deportivo</p>
          <p className="flex items-center gap-2">
            Demo Next.js ·
            <Image src="/brand/favicon.jpg" alt="" width={20} height={20} className="rounded-sm" />
          </p>
        </div>
      </div>
    </footer>
  );
}
