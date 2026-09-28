export function AdSlot({ label = "Publicidad" }: { label?: string }) {
  const slot = process.env.NEXT_PUBLIC_GAM_SLOT_HOME;

  return (
    <div
      className="flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center"
      data-ad-slot={slot ?? "demo"}
      role="complementary"
      aria-label={label}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {slot ? "Google Ad Manager" : "Espacio reservado · GAM en producción"}
        </p>
      </div>
    </div>
  );
}
