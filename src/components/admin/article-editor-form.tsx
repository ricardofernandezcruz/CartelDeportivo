"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  Save,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  scheduledFor?: string | null;
  canPublish: boolean;
};

const emptyDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function extractYoutubeId(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  if (/^[\w-]{11}$/.test(v)) return v;
  try {
    const url = new URL(v.startsWith("http") ? v : `https://${v}`);
    if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "").slice(0, 11);
    const id = url.searchParams.get("v");
    if (id) return id.slice(0, 11);
    const parts = url.pathname.split("/");
    const shorts = parts.findIndex((p) => p === "shorts" || p === "embed");
    if (shorts >= 0 && parts[shorts + 1]) return parts[shorts + 1].slice(0, 11);
  } catch {
    /* ignore */
  }
  return v;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function suggestExcerpt(title: string, html: string) {
  const fromBody = stripHtml(html);
  if (fromBody.length > 40) {
    return fromBody.slice(0, 180).replace(/\s+\S*$/, "") + (fromBody.length > 180 ? "…" : "");
  }
  if (title.trim().length > 8) {
    return `${title.trim()}. Cobertura Cartel Deportivo.`;
  }
  return "";
}

function presetLocal(hoursFromNow: number): string {
  const d = new Date(Date.now() + hoursFromNow * 3600_000);
  d.setSeconds(0, 0);
  return toLocalInputValue(d.toISOString());
}

function tomorrowAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  return toLocalInputValue(d.toISOString());
}

function tonightAt(hour: number): string {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return toLocalInputValue(d.toISOString());
}

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
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

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
  const [scheduleLocal, setScheduleLocal] = useState(toLocalInputValue(initial?.scheduledFor ?? null));
  const canPublish = initial?.canPublish ?? true;

  const checks = useMemo(() => {
    const body = stripHtml(contentHtml);
    return [
      { ok: title.trim().length >= 8, label: "Titular claro (8+ caracteres)" },
      { ok: excerpt.trim().length >= 20, label: "Bajada / lead lista" },
      { ok: Boolean(heroImageUrl), label: "Foto de portada" },
      { ok: body.length >= 40, label: "Cuerpo con contenido" },
      { ok: Boolean(categoryId && authorId), label: "Categoría y firma" },
    ];
  }, [title, excerpt, heroImageUrl, contentHtml, categoryId, authorId]);

  const readyScore = checks.filter((c) => c.ok).length;
  const readyPct = Math.round((readyScore / checks.length) * 100);
  const canGoLive = readyScore >= 4;

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function submit(nextStatus: ArticleStatus) {
    setError(null);
    setSavedMsg(null);

    if (nextStatus === "SCHEDULED" && !scheduleLocal) {
      setError("Elige fecha y hora para programar");
      return;
    }

    startTransition(async () => {
      const result = await saveArticleAction({
        id: initial?.id,
        title,
        excerpt,
        contentJson: contentJson as Prisma.InputJsonValue,
        contentHtml,
        status: nextStatus,
        featured,
        heroImageUrl: heroImageUrl || null,
        youtubeId: extractYoutubeId(youtubeId) || null,
        categoryId,
        authorId,
        tagIds,
        scheduledFor: nextStatus === "SCHEDULED" ? fromLocalInputValue(scheduleLocal) : null,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setStatus(result.status);
      if (result.scheduledFor) setScheduleLocal(toLocalInputValue(result.scheduledFor));

      const msg =
        result.status === "PUBLISHED"
          ? "Publicada. Ya está en el sitio."
          : result.status === "SCHEDULED"
            ? "Programada. Se publicará sola a la hora indicada."
            : result.status === "REVIEW"
              ? "Enviada a revisión."
              : "Borrador guardado.";

      setSavedMsg(msg);
      router.push(`/admin/articulos/${result.id}`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="rounded-2xl border border-[var(--cartel-blue)]/15 bg-gradient-to-br from-[var(--cartel-blue)]/5 via-white to-[var(--cartel-red)]/5 p-4 dark:from-[var(--cartel-blue)]/10 dark:via-card dark:to-[var(--cartel-red)]/10">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cartel-blue)] text-white shadow-sm">
              <Wand2 className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--cartel-blue)]">Asistente de publicación</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                El sistema te guía: completa lo esencial, programa o publica. Slug, SEO básico y portada se
                sincronizan solos.
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--cartel-blue)] to-[var(--cartel-red)] transition-all"
                  style={{ width: `${readyPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
                Listo al {readyPct}% · {readyScore}/{checks.length} puntos
              </p>
            </div>
          </div>
        </div>

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
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Bajada / lead
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="text-[var(--cartel-blue)]"
                onClick={() => setExcerpt(suggestExcerpt(title, contentHtml))}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sugerir
              </Button>
            </div>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Resumen corto para portada, SEO y redes"
              className="resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Cuerpo de la noticia
          </p>
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
        {savedMsg && (
          <p className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> {savedMsg}
          </p>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="bg-gradient-to-r from-[var(--cartel-red)] to-[var(--cartel-blue)] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white/90">Publicación</p>
            <p className="mt-0.5 text-[11px] text-white/75">
              {status === "SCHEDULED"
                ? "Programada — sale sola"
                : status === "PUBLISHED"
                  ? "En el sitio"
                  : "Aún no pública"}
            </p>
          </div>

          <div className="space-y-4 p-4">
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  {c.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={cn(c.ok ? "text-foreground" : "text-muted-foreground")}>{c.label}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
              <Label htmlFor="featured" className="cursor-pointer text-sm">
                Destacada en portada
              </Label>
              <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
            </div>

            {canPublish && (
              <div className="space-y-3 rounded-xl border border-[var(--cartel-blue)]/20 bg-[var(--cartel-blue)]/5 p-3">
                <div className="flex items-center gap-2 text-[var(--cartel-blue)]">
                  <CalendarClock className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Programar salida</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="schedule" className="text-xs">
                    Fecha y hora
                  </Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    value={scheduleLocal}
                    onChange={(e) => setScheduleLocal(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button type="button" size="xs" variant="outline" onClick={() => setScheduleLocal(presetLocal(1))}>
                    +1 h
                  </Button>
                  <Button type="button" size="xs" variant="outline" onClick={() => setScheduleLocal(tonightAt(20))}>
                    Hoy 20:00
                  </Button>
                  <Button type="button" size="xs" variant="outline" onClick={() => setScheduleLocal(tomorrowAt(8))}>
                    Mañana 8:00
                  </Button>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Al programar, el sistema la publica solo a esa hora (cron cada 5 min + chequeo al visitar el sitio).
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <Button disabled={pending} onClick={() => submit("DRAFT")} variant="outline" className="w-full">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar borrador
              </Button>

              {canPublish ? (
                <>
                  <Button
                    disabled={pending || !scheduleLocal || !canGoLive}
                    onClick={() => submit("SCHEDULED")}
                    variant="secondary"
                    className="w-full"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
                    Programar publicación
                  </Button>
                  <Button
                    disabled={pending || !canGoLive}
                    onClick={() => submit("PUBLISHED")}
                    className="w-full bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Publicar ahora
                  </Button>
                </>
              ) : (
                <Button disabled={pending || !canGoLive} onClick={() => submit("REVIEW")} className="w-full">
                  Enviar a revisión
                </Button>
              )}

              {!canGoLive && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Completa al menos 4 puntos del checklist para publicar o programar.
                </p>
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
            <Label>YouTube (URL o ID)</Label>
            <Input
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              onBlur={() => setYoutubeId(extractYoutubeId(youtubeId))}
              placeholder="Pega el enlace completo o el ID"
            />
            <p className="text-[11px] text-muted-foreground">
              Si pegas la URL entera, el sistema extrae el ID solo.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Clasificación</p>
          <div className="space-y-2">
            <Label>Categoría</Label>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No hay categorías. Créalas en{" "}
                <a href="/admin/categorias" className="font-semibold text-[var(--cartel-blue)] hover:underline">
                  Categorías
                </a>
                .
              </p>
            ) : (
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
            )}
          </div>
          <div className="space-y-2">
            <Label>Firma</Label>
            {authors.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No hay autores. Créalos en{" "}
                <a href="/admin/autores" className="font-semibold text-[var(--cartel-blue)] hover:underline">
                  Autores
                </a>
                .
              </p>
            ) : (
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
            )}
          </div>
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No hay etiquetas. Créalas en{" "}
                <a href="/admin/etiquetas" className="font-semibold text-[var(--cartel-blue)] hover:underline">
                  Etiquetas
                </a>
                .
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}>
                    <Badge variant={tagIds.includes(tag.id) ? "default" : "outline"}>{tag.name}</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
