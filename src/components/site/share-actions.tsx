"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareActions({ title }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function shareX() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
  }

  function shareFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Share2 className="h-3.5 w-3.5" />
        Compartir
      </span>
      <Button type="button" variant="outline" size="sm" onClick={copyLink}>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copiado" : "Copiar link"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={shareX}>
        X
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={shareFacebook}>
        Facebook
      </Button>
    </div>
  );
}
