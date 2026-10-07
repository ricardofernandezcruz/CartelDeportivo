"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteMediaAction, updateMediaAltAction } from "@/app/admin/medios/actions";
import { deliveryImageUrl, unoptimizedImage } from "@/lib/media";

export type MediaRow = {
  id: string;
  url: string;
  alt: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export function MediaLibrary({
  items,
  canDelete,
  initialQ = "",
}: {
  items: MediaRow[];
  canDelete: boolean;
  initialQ?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [pending, start] = useTransition();

  function search(e: React.FormEvent) {
    e.preventDefault();
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    router.push(`/admin/medios${params}`);
  }

  if (!items.length && !q) {
    return <p className="text-sm text-muted-foreground">Todavía no hay fotos. Súbelas desde el editor.</p>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="flex max-w-md gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por alt o URL" />
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nada coincide con esa búsqueda.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-[16/10] bg-muted">
                <Image
                  src={deliveryImageUrl(item.url, 640)}
                  alt={item.alt ?? ""}
                  fill
                  className="object-cover"
                  sizes="280px"
                  unoptimized={unoptimizedImage(item.url)}
                />
              </div>
              <div className="space-y-2 p-3">
                <Input
                  defaultValue={item.alt ?? ""}
                  placeholder="Texto alt"
                  disabled={pending}
                  onBlur={(e) => {
                    const next = e.target.value;
                    if (next === (item.alt ?? "")) return;
                    start(async () => {
                      await updateMediaAltAction(item.id, next);
                    });
                  }}
                />
                <p className="truncate text-[11px] text-muted-foreground">{item.url}</p>
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-destructive"
                    disabled={pending}
                    onClick={() => {
                      start(async () => {
                        await deleteMediaAction(item.id);
                      });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Quitar del inventario
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
