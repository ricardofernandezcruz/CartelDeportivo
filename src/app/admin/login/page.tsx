import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { SITE_TAGLINE } from "@/lib/site";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <div className="relative flex h-svh min-h-svh overflow-hidden bg-white text-[var(--cartel-dark)]">
      <div className="absolute inset-x-0 top-0 z-20 h-1.5 bg-gradient-to-r from-[var(--cartel-red)] to-[var(--cartel-blue)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--cartel-red)_0%,_transparent_42%),radial-gradient(ellipse_at_bottom_left,_var(--cartel-blue)_0%,_transparent_38%)] opacity-[0.10]" />

      <div className="relative z-10 flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" aria-label="Cartel Deportivo" className="inline-flex">
            <Image
              src="/brand/logo-mark.png"
              alt="Cartel Deportivo"
              width={200}
              height={44}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <h1 className="mt-10 font-heading text-4xl font-black uppercase tracking-tight text-[var(--cartel-blue)]">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cartel-red)]">
            Sala de redacción
          </p>

          <div className="mt-8">
            <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-8 text-sm text-[var(--cartel-blue)] lg:hidden">{SITE_TAGLINE}.</p>
        </div>
      </div>

      <div className="relative z-10 hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:bg-[var(--cartel-blue)] lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--cartel-red)_0%,_transparent_50%)] opacity-40" />
        <div className="relative max-w-md text-white">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
            Cartel Deportivo
          </p>
          <p className="mt-4 font-heading text-5xl font-black uppercase leading-[0.95] tracking-tight xl:text-6xl">
            {SITE_TAGLINE}
          </p>
          <p className="mt-6 text-base leading-relaxed text-white/80">
            El panel editorial para publicar, programar y cubrir el deporte dominicano
            desde un solo lugar.
          </p>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 overflow-hidden lg:h-52"
      >
        <div className="absolute -bottom-24 left-[-8%] right-[-8%] h-64 rounded-[100%] bg-gradient-to-r from-[var(--cartel-red)] to-[var(--cartel-blue)] opacity-80 blur-2xl lg:right-[42%]" />
      </div>
    </div>
  );
}
