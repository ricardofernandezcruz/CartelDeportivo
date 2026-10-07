"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteTagAction, saveTagAction } from "@/app/admin/etiquetas/actions";
import type { TagType } from "@prisma/client";

export type TagRow = {
  id: string;
  name: string;
  slug: string;
  type: TagType;
};

const TYPE_LABEL: Record<TagType, string> = {
  TEAM: "Equipo",
  PLAYER: "Jugador",
  TOPIC: "Tema",
};

type FormState = { id?: string; name: string; slug: string; type: TagType };

export function TagsManager({ tags }: { tags: TagRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", slug: "", type: "TOPIC" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map: Record<TagType, TagRow[]> = { TEAM: [], PLAYER: [], TOPIC: [] };
    for (const tag of tags) map[tag.type].push(tag);
    return map;
  }, [tags]);

  function openNew() {
    setError(null);
    setForm({ name: "", slug: "", type: "TOPIC" });
    setOpen(true);
  }

  function openEdit(tag: TagRow) {
    setError(null);
    setForm({ id: tag.id, name: tag.name, slug: tag.slug, type: tag.type });
    setOpen(true);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await saveTagAction(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function remove(tag: TagRow) {
    if (!confirm(`¿Borrar la etiqueta ${tag.name}?`)) return;
    startTransition(async () => {
      const result = await deleteTagAction(tag.id);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase">Etiquetas</h1>
          <p className="text-sm text-muted-foreground">Equipos, jugadores y temas para filtrar y SEO.</p>
        </div>
        <Button onClick={openNew} className="bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90">
          <Plus className="h-4 w-4" />
          Nueva etiqueta
        </Button>
      </div>

      {(["TEAM", "PLAYER", "TOPIC"] as TagType[]).map((type) => (
        <section key={type} className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{TYPE_LABEL[type]}</h2>
          <div className="flex flex-wrap gap-2">
            {grouped[type].length === 0 && (
              <p className="text-sm text-muted-foreground">Ninguna aún.</p>
            )}
            {grouped[type].map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-white py-1 pl-3 pr-1 text-sm dark:bg-card"
              >
                {tag.name}
                <button
                  type="button"
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => openEdit(tag)}
                  aria-label={`Editar ${tag.name}`}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => remove(tag)}
                  aria-label={`Borrar ${tag.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </section>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar etiqueta" : "Nueva etiqueta"}</DialogTitle>
            <DialogDescription>Se usan al clasificar cada noticia.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tag-name">Nombre</Label>
              <Input id="tag-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tag-slug">Slug</Label>
              <Input
                id="tag-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="se genera del nombre"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v as TagType })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TOPIC">Tema</SelectItem>
                  <SelectItem value="TEAM">Equipo</SelectItem>
                  <SelectItem value="PLAYER">Jugador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={pending} onClick={submit}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
