"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteArticleAction } from "@/app/admin/articulos/actions";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`¿Borrar “${title}”? Esta acción no se puede deshacer.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteArticleAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/articulos");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" className="text-destructive" disabled={pending} onClick={onDelete}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Borrar
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
