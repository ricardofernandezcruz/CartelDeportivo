"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-[var(--cartel-blue)]/10 via-background to-[var(--cartel-red)]/10 p-6 sm:p-8">
      <h3 className="font-heading text-2xl font-black uppercase tracking-tight">Únete a Cartel Deportivo</h3>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Recibe lo último en béisbol, baloncesto, fútbol y más en tu correo.
      </p>
      {done ? (
        <p className="mt-4 text-sm font-semibold text-[var(--cartel-blue)]">¡Gracias! (demo — sin envío real aún)</p>
      ) : (
        <form
          className="mt-5 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <Input
            type="email"
            required
            placeholder="Tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
          />
          <Button type="submit" className="bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90">
            Suscribete
          </Button>
        </form>
      )}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Al registrarte aceptas nuestros términos y la política de privacidad.
      </p>
    </section>
  );
}
