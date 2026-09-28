"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send, Sparkles } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { saveArticleAction } from "@/app/admin/articulos/actions";
import type { ArticleStatus, Prisma } from "@prisma/client";

type CategoryOption = { id: string; name: string };
type AuthorOption = { id: string; name: string };
type TagOption = { id: string; name: string };

export type ArticleEditorInitial = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  contentJson: object;
  contentHtml: string;
  status: ArticleStatus;
  featured: boolean;
  heroImageUrl: string;
  youtubeId: string;
  categoryId: string;
  authorId: string;
  tagIds: string[];
  canPublish: boolean;
};

const emptyDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function ArticleEditorForm({
  initial,
  categories,
  authors,
  tags,
}: {
  initial?: Partial<ArticleEditorInitial>;
  categories: CategoryOption[];
  authors: AuthorOption[];
  tags: TagOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [contentJson, setContentJson] = useState<object>(initial?.contentJson ?? emptyDoc);
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml ?? "<p></p>");
  const [status, setStatus] = useState<ArticleStatus>(initial?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.heroImageUrl ?? "");
  const [youtubeId, setYoutubeId] = useState(initial?.youtubeId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [authorId, setAuthorId] = useState(initial?.authorId ?? authors[0]?.id ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const canPublish = initial?.canPublish ?? true;

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function submit(nextStatus?: ArticleStatus) {
    setError(null);
    setSavedOk(false);
    startTransition(async () => {
      const result = await saveArticleAction({
        id: initial?.id,
        title,
        excerpt,
        contentJson: contentJson as Prisma.InputJsonValue,
        contentHtml,
        status: nextStatus ?? status,
        featured,
        heroImageUrl: heroImageUrl || null,
        youtubeId: youtubeId || null,
        categoryId,
        authorId,
        tagIds,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSavedOk(true);
      router.push(`/admin/articulos/${result.id}`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Titular
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="El titular que verá el lector"
              className="h-auto border-0 bg-transparent px-0 font-heading text-2xl font-black uppercase tracking-tight shadow-none focus-visible:ring-0 sm:text-3xl"
            />
          </div>
          <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Bajada / lead
            </Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Resumen corto para portada, SEO y redes sociales"
              className="resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Cuerpo de la noticia</p>
          <RichTextEditor
            value={contentJson}
            onChange={(json, html) => {
              setContentJson(json);
              setContentHtml(html);
            }}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {savedOk && (
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Guardado correctamente
          </p>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="bg-gradient-to-r from-[var(--cartel-red)] to-[var(--cartel-blue)] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white/90">Publicación</p>
          </div>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as ArticleStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="REVIEW">En revisión</SelectItem>
                  <SelectItem value="SCHEDULED">Programada</SelectItem>
                  {canPublish && <SelectItem value="PUBLISHED">Publicada</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
              <Label htmlFor="featured" className="cursor-pointer">
                Destacada en portada
              </Label>
              <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button disabled={pending} onClick={() => submit("DRAFT")} variant="outline" className="w-full">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar borrador"}
              </Button>
              {canPublish ? (
                <Button
                  disabled={pending}
                  onClick={() => submit("PUBLISHED")}
                  className="w-full bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>
                      <Send className="h-4 w-4" />
                      Publicar ahora
                    </>
                  )}
                </Button>
              ) : (
                <Button disabled={pending} onClick={() => submit("REVIEW")} className="w-full">
                  Enviar a revisión
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[var(--cartel-blue)]" /> Multimedia
          </p>

          <ImageUpload
            label="Portada / foto principal"
            value={heroImageUrl}
            onChange={setHeroImageUrl}
            onClear={() => setHeroImageUrl("")}
          />

          <div className="space-y-2">
            <Label>YouTube (solo ID del video)</Label>
            <Input
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              placeholder="Ej: dQw4w9WgXcQ"
            />
            <p className="text-[11px] text-muted-foreground">
              Pega solo el ID; el sitio embebe el video automáticamente.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Clasificación</p>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Firma</Label>
            <Select value={authorId} onValueChange={(v) => v && setAuthorId(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {authors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}>
                  <Badge variant={tagIds.includes(tag.id) ? "default" : "outline"}>{tag.name}</Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
