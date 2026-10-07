"use client";

import { useEffect, useId } from "react";

const SLOTS = {
  home: process.env.NEXT_PUBLIC_GAM_SLOT_HOME ?? "",
  article: process.env.NEXT_PUBLIC_GAM_SLOT_ARTICLE ?? process.env.NEXT_PUBLIC_GAM_SLOT_HOME ?? "",
  sidebar: process.env.NEXT_PUBLIC_GAM_SLOT_SIDEBAR ?? process.env.NEXT_PUBLIC_GAM_SLOT_HOME ?? "",
} as const;

type AdSlotName = keyof typeof SLOTS;

declare global {
  interface Window {
    googletag?: {
      cmd: Array<() => void>;
      defineSlot: (path: string, size: number[] | number[][], id: string) => { addService: (s: unknown) => unknown };
      pubads: () => unknown;
      enableServices: () => void;
      display: (id: string) => void;
    };
  }
}

function loadGpt() {
  if (document.getElementById("gpt-script")) return;
  const s = document.createElement("script");
  s.id = "gpt-script";
  s.async = true;
  s.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
  document.head.appendChild(s);
}

export function AdSlot({
  label = "Publicidad",
  slot = "home",
}: {
  label?: string;
  slot?: AdSlotName;
}) {
  const reactId = useId().replace(/:/g, "");
  const divId = `gam-${slot}-${reactId}`;
  const unit = SLOTS[slot];

  useEffect(() => {
    if (!unit) return;
    loadGpt();
    const gpt = (window.googletag ??= { cmd: [] } as unknown as NonNullable<Window["googletag"]>);
    gpt.cmd.push(() => {
      gpt.defineSlot(unit, [[320, 50], [728, 90], [300, 250]], divId).addService(gpt.pubads());
      gpt.enableServices();
      gpt.display(divId);
    });
  }, [divId, unit]);

  if (unit) {
    return (
      <div
        id={divId}
        className="min-h-[90px] w-full overflow-hidden rounded-lg bg-muted/30"
        role="complementary"
        aria-label={label}
      />
    );
  }

  return (
    <div
      className="flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center"
      role="complementary"
      aria-label={label}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
