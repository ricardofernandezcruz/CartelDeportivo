"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Send, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareActions({ title }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const [nativeFailed, setNativeFailed] = useState(false);

  function currentUrl() {
    return window.location.href;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function shareNative() {
    if (!navigator.share) {
      setNativeFailed(true);
      return;
    }
    try {
      await navigator.share({ title, url: currentUrl(), text: title });
    } catch {
      /* user cancelled */
    }
  }

  function shareX() {
    const url = encodeURIComponent(currentUrl());
    const text = encodeURIComponent(title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
  }

  function shareFacebook() {
    const url = encodeURIComponent(currentUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`${title} ${currentUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function shareTelegram() {
    const url = encodeURIComponent(currentUrl());
    const text = encodeURIComponent(title);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Share2 className="h-3.5 w-3.5" />
        Compartir
      </span>
      <Button type="button" variant="outline" size="sm" onClick={shareNative} title="Compartir del teléfono">
        <Share2 className="h-3.5 w-3.5" />
        {nativeFailed ? "Nativo no disponible" : "Enviar"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={copyLink}>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copiado" : "Copiar link"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={shareWhatsApp}>
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={shareTelegram}>
        <Send className="h-3.5 w-3.5" />
        Telegram
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
