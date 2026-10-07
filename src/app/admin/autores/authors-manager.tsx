"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/image-upload";
import { deleteAuthorAction, saveAuthorAction } from "@/app/admin/autores/actions";

export type AuthorRow = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  column: string | null;
  role: string | null;
  featured: boolean;
  sortOrder: number;
  facebook: string | null;
  twitter: string | null;
  tiktok: string | null;
  instagram: string | null;
  _count: { articles: number };
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  column: string;
  role: string;
  featured: boolean;
  sortOrder: number;
  facebook: string;
  twitter: string;
  tiktok: string;
  instagram: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  bio: "",
  avatarUrl: "",
  column: "",
  role: "",
  featured: false,
  sortOrder: 0,
  facebook: "",
  twitter: "",
  tiktok: "",
  instagram: "",
};

function toForm(author?: AuthorRow): FormState {
  if (!author) return emptyForm;
  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    bio: author.bio ?? "",
    avatarUrl: author.avatarUrl ?? "",
    column: author.column ?? "",
    role: author.role ?? "",
    featured: author.featured,
    sortOrder: author.sortOrder,
    facebook: author.facebook ?? "",
    twitter: author.twitter ?? "",
    tiktok: author.tiktok ?? "",
    instagram: author.instagram ?? "",
  };
}

export function AuthorsManager({ authors }: { authors: AuthorRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const title = form.id ? "Editar autor" : "Nuevo autor";

  function openNew() {
    setError(null);
    setForm({ ...emptyForm, sortOrder: authors.length + 1 });
    setOpen(true);
  }

  function openEdit(author: AuthorRow) {
    setError(null);
    setForm(toForm(author));
    setOpen(true);
  }

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await saveAuthorAction({
        id: form.id,
        name: form.name,
        slug: form.slug,
        bio: form.bio,
        avatarUrl: form.avatarUrl || null,
        column: form.column,
        role: form.role,
        featured: form.featured,
        sortOrder: form.sortOrder,
        facebook: form.facebook,
        twitter: form.twitter,
        tiktok: form.tiktok,
        instagram: form.instagram,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function remove(author: AuthorRow) {
    if (!confirm(`¿Borrar a ${author.name}? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      const result = await deleteAuthorAction(author.id);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  const sorted = useMemo(
    () => [...authors].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es")),
    [authors],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase">Autores</h1>
          <p className="text-sm text-muted-foreground">
            Firmas, avatares y perfiles. Marca “Mostrar en Opiniones” para que salgan en el home.
          </p>
        </div>
        <Button onClick={openNew} className="bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90">
          <Plus className="h-4 w-4" />
          Nuevo autor
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((author) => (
          <Card key={author.id}>
            <CardContent className="flex items-start gap-4 pt-6">
              <Avatar className="h-14 w-14">
                {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
                <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{author.name}</p>
                  {author.featured && (
                    <Badge className="bg-[var(--cartel-blue)] text-[10px] uppercase">Opiniones</Badge>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {author.column || "Sin columna"} · {author._count.articles} noticias
                </p>
                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => openEdit(author)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={pending}
                    onClick={() => remove(author)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Borrar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-semibold">Aún no hay autores</p>
          <p className="mt-1 text-sm text-muted-foreground">Crea el primero para firmar las noticias.</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              El avatar y la bio se ven en el sitio. Si está marcado en Opiniones, aparece en el home.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <ImageUpload
              label="Avatar / foto"
              value={form.avatarUrl}
              onChange={(url) => patch("avatarUrl", url)}
              onClear={() => patch("avatarUrl", "")}
              aspectClassName="aspect-square max-w-[180px]"
            />
            <div className="space-y-1.5">
              <Label htmlFor="author-name">Nombre</Label>
              <Input id="author-name" value={form.name} onChange={(e) => patch("name", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="author-column">Columna</Label>
                <Input
                  id="author-column"
                  value={form.column}
                  onChange={(e) => patch("column", e.target.value)}
                  placeholder="Béisbol, Entre Cuerdas…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author-role">Cargo</Label>
                <Input
                  id="author-role"
                  value={form.role}
                  onChange={(e) => patch("role", e.target.value)}
                  placeholder="Editor deportivo"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author-bio">Biografía</Label>
              <Textarea id="author-bio" rows={4} value={form.bio} onChange={(e) => patch("bio", e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="author-featured" className="cursor-pointer">
                Mostrar en Opiniones (home)
              </Label>
              <Switch
                id="author-featured"
                checked={form.featured}
                onCheckedChange={(v) => patch("featured", Boolean(v))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="author-slug">Slug URL</Label>
                <Input
                  id="author-slug"
                  value={form.slug}
                  onChange={(e) => patch("slug", e.target.value)}
                  placeholder="se genera del nombre"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author-order">Orden</Label>
                <Input
                  id="author-order"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => patch("sortOrder", Number(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="author-fb">Facebook</Label>
                <Input id="author-fb" value={form.facebook} onChange={(e) => patch("facebook", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author-x">X / Twitter</Label>
                <Input id="author-x" value={form.twitter} onChange={(e) => patch("twitter", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author-tt">TikTok</Label>
                <Input id="author-tt" value={form.tiktok} onChange={(e) => patch("tiktok", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author-ig">Instagram</Label>
                <Input id="author-ig" value={form.instagram} onChange={(e) => patch("instagram", e.target.value)} />
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
