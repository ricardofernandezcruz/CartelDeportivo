"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deliveryImageUrl, unoptimizedImage } from "@/lib/media";

type Asset = {
  id: string;
  url: string;
  alt: string | null;
  mimeType: string | null;
  createdAt: string;
};

export function MediaPicker({ onPick }: { onPick: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      fetch(`/api/media${params}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((data: { items?: Asset[] }) => setItems(data.items ?? []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [open, q]);

  return (
    <>
      <Button type="button" variant="outline" size="xs" onClick={() => setOpen(true)}>
        <FolderOpen className="h-3.5 w-3.5" />
        Biblioteca
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Biblioteca de medios</DialogTitle>
            <DialogDescription>Busca y reutiliza una foto ya subida.</DialogDescription>
          </DialogHeader>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o URL"
            autoFocus
          />
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay imágenes que coincidan.</p>
          ) : (
            <div className="grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onPick(item.url);
                    setOpen(false);
                  }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted hover:ring-2 hover:ring-[var(--cartel-blue)]"
                  title={item.alt ?? item.url}
                >
                  <Image
                    src={deliveryImageUrl(item.url, 400)}
                    alt={item.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized={unoptimizedImage(item.url)}
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
