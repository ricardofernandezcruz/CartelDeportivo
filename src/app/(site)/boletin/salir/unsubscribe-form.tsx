"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UnsubscribeForm() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--cartel-red)]">Boletín</p>
      <h1 className="mt-3 font-heading text-3xl font-black uppercase">Cancelar suscripción</h1>
      {done ? (
        <p className="mt-4 text-muted-foreground">Listo. Ya no te escribimos a {email || "ese correo"}.</p>
      ) : (
        <>
          <p className="mt-4 text-muted-foreground">
            {email ? `¿Sacamos ${email} de la lista?` : "Indica el correo desde el enlace del boletín."}
          </p>
          <Button
            className="mt-6"
            disabled={!email || pending}
            onClick={async () => {
              setPending(true);
              setError(null);
              try {
                const res = await fetch(`/api/newsletter?email=${encodeURIComponent(email)}`, { method: "DELETE" });
                if (!res.ok) {
                  setError("No se pudo cancelar. Inténtalo otra vez.");
                  return;
                }
                setDone(true);
              } catch {
                setError("Error de red.");
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? "Cancelando…" : "Sí, darme de baja"}
          </Button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
