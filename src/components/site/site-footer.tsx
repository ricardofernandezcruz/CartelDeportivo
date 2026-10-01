import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/site/social-icons";

const footerSocial = [
  { label: "Facebook", href: "https://www.facebook.com/", Icon: FacebookIcon },
  { label: "X", href: "https://x.com/", Icon: XIcon },
  { label: "Instagram", href: "https://www.instagram.com/", Icon: InstagramIcon },
  { label: "YouTube", href: "https://www.youtube.com/", Icon: YoutubeIcon },
] as const;

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--cartel-blue)] text-[10px] font-black tracking-tight text-white ${className}`}
      aria-hidden
    >
      CD
    </span>
  );
}

function AccentArcs() {
  return (
    <div className="relative h-10 w-14 shrink-0" aria-hidden>
      <span className="absolute left-0 top-1 h-8 w-8 rounded-full border-[3px] border-[var(--cartel-red)]" />
      <span className="absolute left-3.5 top-1 h-8 w-8 rounded-full border-[3px] border-[var(--cartel-blue)]" />
      <span className="absolute left-7 top-1 h-8 w-8 rounded-full border-[3px] border-[var(--cartel-red)]/75" />
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#f8fafc] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.25rem] border border-[#e5e7eb] bg-white text-[var(--cartel-dark)]">
        <div className="grid lg:grid-cols-2">
          {/* CTA izquierda — como footer-06 */}
          <div className="flex flex-col justify-center border-b border-[#e5e7eb] p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
            <h2 className="max-w-md font-heading text-[1.85rem] font-black uppercase leading-[1.08] tracking-tight text-[var(--cartel-dark)] sm:text-4xl lg:text-[2.75rem]">
              ¿Listo para lo más reciente del deporte?{" "}
              <span className="text-[var(--cartel-blue)]">Síguenos.</span>
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">Lo más completo en deportes</p>
          </div>

          {/* Contacto derecha */}
          <div className="flex flex-col">
            <div className="flex flex-1 flex-col justify-center gap-8 border-b border-[#e5e7eb] p-8 sm:p-10 lg:p-12">
              <div className="flex items-center gap-3">
                <Image
                  src="https://i.pravatar.cc/150?u=pappy-perez"
                  alt="Pappy Pérez"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <AccentArcs />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--cartel-dark)]">Pappy Pérez</p>
                  <p className="text-sm text-muted-foreground">Director · Cronista deportivo</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--cartel-dark)]">Contáctanos</p>
                <a
                  href="mailto:redaccion@carteldeportivo.com"
                  className="mt-1 block break-all text-xl font-bold tracking-tight text-[var(--cartel-dark)] underline-offset-4 transition hover:text-[var(--cartel-blue)] hover:underline sm:text-2xl"
                >
                  redaccion@carteldeportivo.com
                </a>
              </div>

              <Link
                href="/acerca"
                className="inline-flex w-full max-w-xs items-center justify-between rounded-full bg-[var(--cartel-blue)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--cartel-red)]"
              >
                Sobre nosotros
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--cartel-blue)]">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </Link>
            </div>

            {/* Grid de redes — 4 celdas */}
            <div className="grid grid-cols-4">
              {footerSocial.map(({ label, href, Icon }, i) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`flex h-[4.25rem] items-center justify-center text-[var(--cartel-dark)] transition hover:bg-[var(--cartel-blue)]/[0.04] hover:text-[var(--cartel-blue)] ${
                    i < footerSocial.length - 1 ? "border-r border-[#e5e7eb]" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col gap-4 border-t border-[#e5e7eb] px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <BrandMark />
            <span className="text-sm font-bold tracking-tight">carteldeportivo.</span>
          </Link>

          <p className="text-xs text-muted-foreground">
            © {year} carteldeportivo. Todos los derechos reservados.
          </p>

          <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span>Diseñado por</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--cartel-dark)]">
              <BrandMark className="h-5 w-5 text-[8px]" />
              Codemasters
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
