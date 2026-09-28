import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#111] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--cartel-red)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_var(--cartel-blue)_0%,_transparent_45%)] opacity-40" />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
        <div className="flex flex-col items-center border-b border-border bg-gradient-to-b from-muted/40 to-white px-8 py-7">
          <Image src="/brand/logo-mark.png" alt="Cartel Deportivo" width={200} height={44} className="h-11 w-auto" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Sala de redacción</p>
        </div>
        <div className="px-8 py-7">
          <h1 className="font-heading text-2xl font-black uppercase tracking-tight">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Demo: <span className="font-medium text-foreground">editor@carteldeportivo.com</span> /{" "}
            <span className="font-medium text-foreground">demo1234</span>
          </p>
          <div className="mt-6">
            <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
