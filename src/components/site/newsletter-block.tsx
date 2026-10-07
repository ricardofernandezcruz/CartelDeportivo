"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-[var(--cartel-blue)]/10 via-background to-[var(--cartel-red)]/10 p-6 sm:p-8">
      <h3 className="font-heading text-2xl font-black uppercase tracking-tight">Únete a Cartel Deportivo</h3>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Recibe lo último en béisbol, baloncesto, fútbol y más en tu correo.
      </p>
      {done ? (
        <p className="mt-4 text-sm font-semibold text-[var(--cartel-blue)]">Listo. Te avisamos cuando haya nota fuerte.</p>
      ) : (
        <form
          className="mt-5 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setPending(true);
            try {
              const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              const data = (await res.json()) as { error?: string };
              if (!res.ok) {
                setError(data.error ?? "No se pudo guardar el correo");
                return;
              }
              setDone(true);
            } catch {
              setError("Error de red. Inténtalo de nuevo.");
            } finally {
              setPending(false);
            }
          }}
        >
          <Input
            type="email"
            required
            placeholder="Tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
            autoComplete="email"
          />
          <Button type="submit" disabled={pending} className="bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90">
            {pending ? "Enviando…" : "Suscribete"}
          </Button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Al registrarte aceptas nuestros{" "}
        <Link href="/terminos" className="underline hover:text-[var(--cartel-blue)]">
          términos
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" className="underline hover:text-[var(--cartel-blue)]">
          política de privacidad
        </Link>
        .
      </p>
    </section>
  );
}
