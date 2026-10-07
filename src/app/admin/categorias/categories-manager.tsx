"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { deleteCategoryAction, saveCategoryAction } from "@/app/admin/categorias/actions";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sortOrder: number;
  _count: { articles: number };
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  sortOrder: number;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  color: "#0054a6",
  sortOrder: 0,
};

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setError(null);
    setForm({ ...emptyForm, sortOrder: categories.length + 1 });
    setOpen(true);
  }

  function openEdit(cat: CategoryRow) {
    setError(null);
    setForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      color: cat.color,
      sortOrder: cat.sortOrder,
    });
    setOpen(true);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await saveCategoryAction(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function remove(cat: CategoryRow) {
    if (!confirm(`¿Borrar la categoría ${cat.name}?`)) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(cat.id);
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
          <h1 className="font-heading text-3xl font-black uppercase">Categorías</h1>
          <p className="text-sm text-muted-foreground">Secciones del sitio: béisbol, fútbol, boxeo…</p>
        </div>
        <Button onClick={openNew} className="bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90">
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{cat.name}</CardTitle>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>/{cat.slug}</p>
              <Badge variant="secondary">{cat._count.articles} noticias</Badge>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => openEdit(cat)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  disabled={pending}
                  onClick={() => remove(cat)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Borrar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-semibold">No hay categorías</p>
          <p className="mt-1 text-sm text-muted-foreground">Crea al menos una para publicar noticias.</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
            <DialogDescription>Nombre, color y orden en el menú.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input id="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="se genera del nombre"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Descripción</Label>
              <Textarea
                id="cat-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-[auto_1fr_auto] items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cat-color">Color</Label>
                <Input
                  id="cat-color"
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-10 w-14 cursor-pointer p-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-hex">Hex</Label>
                <Input
                  id="cat-hex"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-order">Orden</Label>
                <Input
                  id="cat-order"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                />
              </div>
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
