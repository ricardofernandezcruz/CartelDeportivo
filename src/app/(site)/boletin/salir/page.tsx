import { Suspense } from "react";
import { UnsubscribeForm } from "./unsubscribe-form";

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">Cargando…</div>
      }
    >
      <UnsubscribeForm />
    </Suspense>
  );
}
