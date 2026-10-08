"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  Eye,
  Loader2,
  Monitor,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { DatetimeRd } from "@/components/admin/datetime-rd";
import { ArticleBody } from "@/components/site/article-body";
import { restoreRevisionAction, saveArticleAction } from "@/app/admin/articulos/actions";
import type { ArticleStatus, Prisma } from "@prisma/client";
import { cn } from "@/lib/utils";
import { SITE_TZ, santoDomingoToIso } from "@/lib/timezone";
import { toSlug } from "@/lib/slug";
import { formatSchedule, readingTimeMinutes, wordCount, stripHtml as stripHtmlShared } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  heroAlt: string;
  heroCredit: string;
  heroCaption: string;
  heroFocalX: number;
  heroFocalY: number;
  youtubeId: string;
  categoryId: string;
  authorId: string;
  tagIds: string[];
  scheduledFor?: string | null;
  canPublish: boolean;
  updatedAt?: string | null;
  revisions?: Array<{ id: string; createdAt: string; editorName: string | null }>;
  flash?: "publicada" | "programada" | "guardada" | "revision" | null;
};

const emptyDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const TEMPLATES: Record<string, { label: string; json: object; html: string }> = {
  nota: {
    label: "Nota",
    json: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Santiago.– " }] },
        { type: "paragraph", content: [{ type: "text", text: "El dato clave: " }] },
        { type: "paragraph" },
      ],
    },
    html: "<p>Santiago.– </p><p>El dato clave: </p><p></p>",
  },
  cronica: {
    label: "Crónica",
    json: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Había un ruido distinto en el estadio." }] },
        { type: "paragraph", content: [{ type: "text", text: "Lo que pasó después cambió el partido:" }] },
        { type: "paragraph" },
      ],
    },
    html: "<p>Había un ruido distinto en el estadio.</p><p>Lo que pasó después cambió el partido:</p><p></p>",
  },
  opinion: {
    label: "Opinión",
    json: {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Hay que decirlo claro: " }] },
        { type: "paragraph", content: [{ type: "text", text: "El argumento de fondo es este." }] },
        { type: "paragraph" },
      ],
    },
    html: "<p>Hay que decirlo claro: </p><p>El argumento de fondo es este.</p><p></p>",
  },
};

function partsInRd(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const bag = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
  };
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
  return stripHtmlShared(html);
}

function imagesMissingAlt(json: unknown) {
  let missing = 0;
  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as { type?: string; attrs?: Record<string, unknown>; content?: unknown[] };
    if (n.type === "articleImage" || n.type === "image") {
      if (!String(n.attrs?.alt ?? "").trim()) missing += 1;
    }
    for (const child of n.content ?? []) walk(child);
  }
  walk(json);
  return missing;
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

function isoAtRd(year: number, month: number, day: number, hour: number, minute = 0) {
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return santoDomingoToIso(`${dd}/${mm}/${year}`, `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`) ?? "";
}

function presetFromNow(hoursFromNow: number): string {
  const d = new Date(Date.now() + hoursFromNow * 3600_000);
  d.setSeconds(0, 0);
  return d.toISOString();
}

function tomorrowAt(hour: number, minute = 0): string {
  const p = partsInRd(new Date());
  const next = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
  return isoAtRd(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), hour, minute);
}

function tonightAt(hour: number): string {
  const p = partsInRd(new Date());
  const candidate = isoAtRd(p.year, p.month, p.day, hour, 0);
  if (candidate && new Date(candidate).getTime() > Date.now()) return candidate;
  return tomorrowAt(hour);
}

type EditorNotice =
  | { tone: "error"; message: string }
  | { tone: "success"; message: string; status: ArticleStatus; slug?: string }
  | { tone: "quiet"; message: string };

type FlashKind = NonNullable<ArticleEditorInitial["flash"]>;

function flashToNotice(
  flash: FlashKind | null | undefined,
  initial?: Partial<ArticleEditorInitial>,
): EditorNotice | null {
  if (!flash) return null;
  const status: ArticleStatus =
    flash === "publicada"
      ? "PUBLISHED"
      : flash === "programada"
        ? "SCHEDULED"
        : flash === "revision"
          ? "REVIEW"
          : "DRAFT";
  return {
    tone: "success",
    message: successMessage(status, initial?.scheduledFor),
    status,
    slug: initial?.slug,
  };
}

function flashFromStatus(status: ArticleStatus): FlashKind {
  if (status === "PUBLISHED") return "publicada";
  if (status === "SCHEDULED") return "programada";
  if (status === "REVIEW") return "revision";
  return "guardada";
}

function successMessage(status: ArticleStatus, scheduledFor?: string | null) {
  if (status === "PUBLISHED") return "Publicada. Ya está en el sitio.";
  if (status === "SCHEDULED") {
    if (scheduledFor) {
      return `Programada. Se publicará el ${formatSchedule(new Date(scheduledFor))}.`;
    }
    return "Programada. Se publicará sola a la hora indicada.";
  }
  if (status === "REVIEW") return "Enviada a revisión.";
  return "Borrador guardado.";
}

function EditorNoticeCard({
  notice,
  compact,
  onDismiss,
}: {
  notice: EditorNotice;
  compact?: boolean;
  onDismiss: () => void;
}) {
  const isError = notice.tone === "error";
  const isQuiet = notice.tone === "quiet";
  const publishedSlug = notice.tone === "success" && notice.status === "PUBLISHED" ? notice.slug : undefined;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm shadow-sm",
        isError
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : isQuiet
            ? "border-border bg-muted/60 text-muted-foreground"
            : "border-emerald-500/30 bg-emerald-500/10 font-medium text-emerald-800 dark:text-emerald-300",
      )}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className={cn(compact ? "text-xs leading-relaxed" : "leading-relaxed")}>{notice.message}</p>
        {publishedSlug ? (
          <Link
            href={`/noticia/${publishedSlug}`}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "outline", size: "xs" }),
              "mt-2 border-emerald-600/30 bg-white/60 text-emerald-800 hover:bg-white dark:bg-emerald-950/40 dark:text-emerald-200",
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver en el sitio
          </Link>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100"
        aria-label="Cerrar aviso"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
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
  const [busyAction, setBusyAction] = useState<ArticleStatus | null>(null);
  const [notice, setNotice] = useState<EditorNotice | null>(() => flashToNotice(initial?.flash, initial));

  const [articleId, setArticleId] = useState(initial?.id);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [contentJson, setContentJson] = useState<object>(initial?.contentJson ?? emptyDoc);
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml ?? "<p></p>");
  const [status, setStatus] = useState<ArticleStatus>(initial?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.heroImageUrl ?? "");
  const [heroAlt, setHeroAlt] = useState(initial?.heroAlt ?? "");
  const [heroCredit, setHeroCredit] = useState(initial?.heroCredit ?? "");
  const [heroCaption, setHeroCaption] = useState(initial?.heroCaption ?? "");
  const [heroFocalX, setHeroFocalX] = useState(initial?.heroFocalX ?? 50);
  const [heroFocalY, setHeroFocalY] = useState(initial?.heroFocalY ?? 50);
  const [youtubeId, setYoutubeId] = useState(initial?.youtubeId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [authorId, setAuthorId] = useState(initial?.authorId ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [scheduleIso, setScheduleIso] = useState(initial?.scheduledFor ?? "");
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(initial?.updatedAt ?? "");
  const [revisions] = useState(initial?.revisions ?? []);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewWide, setPreviewWide] = useState(true);
  const dirtyRef = useRef(false);
  const skipInitialDirty = useRef(true);
  const sidebarNoticeRef = useRef<HTMLDivElement>(null);
  const canPublish = initial?.canPublish ?? true;
  const categoryItems = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const authorItems = Object.fromEntries(authors.map((a) => [a.id, a.name]));
  const slugPreview = slug.trim() ? toSlug(slug) : toSlug(title);
  const words = wordCount(stripHtml(contentHtml));
  const minutes = readingTimeMinutes(contentHtml);
  const missingAlts = imagesMissingAlt(contentJson);

  const checks = useMemo(() => {
    const body = stripHtml(contentHtml);
    return [
      { ok: title.trim().length >= 8 && title.trim().length <= 90, label: "Titular (8–90 caracteres)" },
      { ok: excerpt.trim().length >= 20 && excerpt.trim().length <= 220, label: "Bajada / lead lista" },
      { ok: Boolean(heroImageUrl), label: "Foto de portada" },
      { ok: words >= 80 || body.length >= 400, label: "Cuerpo con contenido (≈80 palabras)" },
      { ok: Boolean(categoryId && authorId), label: "Categoría y firma" },
    ];
  }, [title, excerpt, heroImageUrl, words, contentHtml, categoryId, authorId]);

  const hints = useMemo(
    () => [
      { ok: Boolean(!heroImageUrl || heroAlt.trim()), label: "Texto alt de la portada" },
      { ok: missingAlts === 0, label: "Alt en fotos del cuerpo" },
      { ok: tagIds.length > 0, label: "Al menos una etiqueta" },
    ],
    [heroImageUrl, heroAlt, missingAlts, tagIds],
  );

  const readyScore = checks.filter((c) => c.ok).length;
  const readyPct = Math.round((readyScore / checks.length) * 100);
  const canGoLive = checks.every((c) => c.ok);

  function markDirty() {
    dirtyRef.current = true;
  }

  function toggleTag(id: string) {
    markDirty();
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function payload(nextStatus: ArticleStatus) {
    return {
      id: articleId,
      title,
      slug: slugPreview,
      excerpt,
      contentJson: contentJson as Prisma.InputJsonValue,
      contentHtml,
      status: nextStatus,
      featured,
      heroImageUrl: heroImageUrl || null,
      heroAlt: heroAlt || null,
      heroCredit: heroCredit || null,
      heroCaption: heroCaption || null,
      heroFocalX,
      heroFocalY,
      youtubeId: extractYoutubeId(youtubeId) || null,
      categoryId,
      authorId,
      tagIds,
      scheduledFor: nextStatus === "SCHEDULED" ? scheduleIso || null : null,
      expectedUpdatedAt: expectedUpdatedAt || undefined,
    };
  }

  function submit(nextStatus: ArticleStatus) {
    if (!categoryId || !authorId) {
      setNotice({ tone: "error", message: "Elige categoría y firma antes de guardar." });
      return;
    }

    if (nextStatus === "SCHEDULED" && !scheduleIso) {
      setNotice({ tone: "error", message: "Elige fecha y hora para programar." });
      return;
    }

    setBusyAction(nextStatus);
    setNotice(null);

    startTransition(async () => {
      try {
        const result = await saveArticleAction(payload(nextStatus));

        if (!result.ok) {
          setNotice({ tone: "error", message: result.error });
          return;
        }

        dirtyRef.current = false;
        setArticleId(result.id);
        setSlug(result.slug);
        setStatus(result.status);
        if (result.updatedAt) setExpectedUpdatedAt(result.updatedAt);
        if (result.scheduledFor) setScheduleIso(result.scheduledFor);

        if (result.status === "PUBLISHED" || result.status === "SCHEDULED") {
          const params = new URLSearchParams();
          params.set("estado", result.status);
          params.set("hecho", flashFromStatus(result.status));
          if (result.slug) params.set("slug", result.slug);
          if (result.scheduledFor) params.set("cuando", result.scheduledFor);
          router.push(`/admin/articulos?${params.toString()}`);
          return;
        }

        const nextNotice: EditorNotice = {
          tone: "success",
          message: successMessage(result.status, result.scheduledFor),
          status: result.status,
          slug: result.slug,
        };

        if (!articleId) {
          router.push(`/admin/articulos/${result.id}?hecho=${flashFromStatus(result.status)}`);
          return;
        }

        setNotice(nextNotice);
        router.refresh();
      } catch (err) {
        const digest =
          err && typeof err === "object" && "digest" in err ? String((err as { digest?: unknown }).digest) : "";
        if (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND")) {
          throw err;
        }
        console.error(err);
        setNotice({
          tone: "error",
          message: "No se pudo completar. Espera un momento e inténtalo de nuevo.",
        });
      } finally {
        setBusyAction(null);
      }
    });
  }

  useEffect(() => {
    if (!initial?.flash || !initial.id) return;
    router.replace(`/admin/articulos/${initial.id}`, { scroll: false });
  }, [initial?.flash, initial?.id, router]);

  useEffect(() => {
    if (!notice || notice.tone === "error") return;
    const ms = notice.tone === "quiet" ? 4000 : 9000;
    const timer = window.setTimeout(() => setNotice(null), ms);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!notice || notice.tone === "quiet") return;
    sidebarNoticeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [notice]);

  useEffect(() => {
    if (skipInitialDirty.current) {
      skipInitialDirty.current = false;
      return;
    }
    dirtyRef.current = true;
  }, [
    title,
    slug,
    excerpt,
    contentHtml,
    featured,
    heroImageUrl,
    heroAlt,
    heroCredit,
    heroCaption,
    heroFocalX,
    heroFocalY,
    youtubeId,
    categoryId,
    authorId,
    tagIds,
    scheduleIso,
  ]);

  useEffect(() => {
    function onUnload(e: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  useEffect(() => {
    if (!articleId) return;
    if (status === "PUBLISHED" || status === "SCHEDULED") return;
    const timer = window.setTimeout(() => {
      if (!dirtyRef.current || !categoryId || !authorId || title.trim().length < 8) return;
      void saveArticleAction(payload("DRAFT")).then((result) => {
        if (result.ok) {
          dirtyRef.current = false;
          if (result.updatedAt) setExpectedUpdatedAt(result.updatedAt);
          setNotice((current) =>
            current && current.tone !== "quiet" ? current : { tone: "quiet", message: "Autoguardado" },
          );
        }
      });
    }, 20_000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce on editor fields
  }, [
    articleId,
    title,
    slug,
    excerpt,
    contentHtml,
    featured,
    heroImageUrl,
    heroAlt,
    heroCredit,
    heroCaption,
    heroFocalX,
    heroFocalY,
    youtubeId,
    categoryId,
    authorId,
    tagIds,
    status,
  ]);

  return (
    <>
    {notice && notice.tone !== "quiet" ? (
      <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4 sm:justify-end sm:px-6">
        <div className="pointer-events-auto w-full max-w-md shadow-lg">
          <EditorNoticeCard notice={notice} onDismiss={() => setNotice(null)} />
        </div>
      </div>
    ) : null}
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
            <p className="text-[11px] text-muted-foreground">{title.trim().length}/90</p>
          </div>
          <div className="mt-3 space-y-1">
            <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Slug / URL
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={toSlug(title) || "url-de-la-noticia"}
              className="h-9 font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">/noticia/{slugPreview || "…"}</p>
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
            <p className="text-[11px] text-muted-foreground">{excerpt.trim().length}/220</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cuerpo de la noticia
            </p>
            <div className="flex items-center gap-2">
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setContentJson(tpl.json);
                    setContentHtml(tpl.html);
                  }}
                >
                  {tpl.label}
                </Button>
              ))}
              <p className="text-[11px] text-muted-foreground">
                {words} palabras · {minutes} min
              </p>
              <Button type="button" variant="outline" size="xs" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-3.5 w-3.5" />
                Vista previa
              </Button>
            </div>
          </div>
          <RichTextEditor
            value={contentJson}
            onChange={(json, html) => {
              setContentJson(json);
              setContentHtml(html);
            }}
          />
        </div>

      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div
            className={cn(
              "px-4 py-3",
              status === "PUBLISHED"
                ? "bg-emerald-600"
                : status === "SCHEDULED"
                  ? "bg-violet-600"
                  : "bg-gradient-to-r from-[var(--cartel-red)] to-[var(--cartel-blue)]",
            )}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-white/90">Publicación</p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {status === "SCHEDULED"
                ? "Programada — sale sola"
                : status === "PUBLISHED"
                  ? "Publicada — en el sitio"
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
            <ul className="space-y-1.5 border-t border-border/60 pt-3">
              {hints.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-[11px]">
                  {c.ok ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground" />
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
                <DatetimeRd id="schedule" valueIso={scheduleIso} onChangeIso={setScheduleIso} />
                <div className="flex flex-wrap gap-1.5">
                  <Button type="button" size="xs" variant="outline" onClick={() => setScheduleIso(presetFromNow(1))}>
                    +1 h
                  </Button>
                  <Button type="button" size="xs" variant="outline" onClick={() => setScheduleIso(tonightAt(20))}>
                    Hoy 20:00
                  </Button>
                  <Button type="button" size="xs" variant="outline" onClick={() => setScheduleIso(tomorrowAt(8))}>
                    Mañana 8:00
                  </Button>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Al programar, el sistema la publica a esa hora. En Vercel Hobby el cron corre 1 vez al día; al visitar
                  el sitio también se publican las vencidas.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              {notice ? (
                <div ref={sidebarNoticeRef}>
                  <EditorNoticeCard notice={notice} compact onDismiss={() => setNotice(null)} />
                </div>
              ) : null}

              <Button disabled={pending} onClick={() => submit("DRAFT")} variant="outline" className="w-full">
                {busyAction === "DRAFT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {busyAction === "DRAFT" ? "Guardando…" : "Guardar borrador"}
              </Button>

              {canPublish ? (
                <>
                  <Button
                    disabled={pending || !scheduleIso || !canGoLive}
                    onClick={() => submit("SCHEDULED")}
                    variant="secondary"
                    className="w-full"
                  >
                    {busyAction === "SCHEDULED" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Clock3 className="h-4 w-4" />
                    )}
                    {busyAction === "SCHEDULED" ? "Programando…" : "Programar publicación"}
                  </Button>
                  <Button
                    disabled={pending || !canGoLive}
                    onClick={() => submit("PUBLISHED")}
                    className="w-full bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90"
                  >
                    {busyAction === "PUBLISHED" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {busyAction === "PUBLISHED" ? "Publicando…" : "Publicar ahora"}
                  </Button>
                </>
              ) : (
                <Button disabled={pending || !canGoLive} onClick={() => submit("REVIEW")} className="w-full">
                  {busyAction === "REVIEW" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {busyAction === "REVIEW" ? "Enviando…" : "Enviar a revisión"}
                </Button>
              )}

              {!canGoLive && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Completa todos los puntos del checklist, incluida categoría y firma, para publicar o programar.
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
            focalX={heroFocalX}
            focalY={heroFocalY}
            onFocalChange={(x, y) => {
              setHeroFocalX(x);
              setHeroFocalY(y);
            }}
          />
          {heroImageUrl && (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="hero-alt">Texto alt</Label>
                <Input
                  id="hero-alt"
                  value={heroAlt}
                  onChange={(e) => setHeroAlt(e.target.value)}
                  placeholder="Describe la foto"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hero-caption">Pie de foto</Label>
                <Input
                  id="hero-caption"
                  value={heroCaption}
                  onChange={(e) => setHeroCaption(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hero-credit">Crédito (opcional)</Label>
                <Input
                  id="hero-credit"
                  value={heroCredit}
                  onChange={(e) => setHeroCredit(e.target.value)}
                  placeholder="Fotógrafo o agencia"
                />
              </div>
            </div>
          )}

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
              <Select
                value={categoryId || null}
                onValueChange={(v) => setCategoryId(v ?? "")}
                items={categoryItems}
              >
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Elige categoría">
                    {categoryId ? categoryItems[categoryId] : null}
                  </SelectValue>
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
              <Select
                value={authorId || null}
                onValueChange={(v) => setAuthorId(v ?? "")}
                items={authorItems}
              >
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Elige firma">
                    {authorId ? authorItems[authorId] : null}
                  </SelectValue>
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
        {revisions.length > 0 && (
          <div className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Historial</p>
            <ul className="space-y-2">
              {revisions.map((rev) => (
                <li key={rev.id} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-muted-foreground">
                    {new Date(rev.createdAt).toLocaleString("es-DO")}
                    {rev.editorName ? ` · ${rev.editorName}` : ""}
                  </span>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      startTransition(async () => {
                        const result = await restoreRevisionAction(rev.id);
                        if (!result.ok) {
                          setNotice({ tone: "error", message: result.error });
                          return;
                        }
                        setTitle(result.title);
                        setExcerpt(result.excerpt);
                        setContentJson(result.contentJson);
                        setContentHtml(result.contentHtml);
                        setNotice({
                          tone: "quiet",
                          message: "Versión restaurada en el editor. Guarda para aplicarla.",
                        });
                      });
                    }}
                  >
                    Restaurar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Vista previa</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Button type="button" size="xs" variant={previewWide ? "default" : "outline"} onClick={() => setPreviewWide(true)}>
            <Monitor className="h-3.5 w-3.5" />
            Escritorio
          </Button>
          <Button type="button" size="xs" variant={!previewWide ? "default" : "outline"} onClick={() => setPreviewWide(false)}>
            <Smartphone className="h-3.5 w-3.5" />
            Móvil
          </Button>
        </div>
        <div className={cn("mx-auto overflow-hidden rounded-xl border border-border bg-background p-4", previewWide ? "max-w-3xl" : "max-w-[390px]")}>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {categories.find((c) => c.id === categoryId)?.name ?? "Sin categoría"}
          </p>
          <h2 className="mt-2 font-heading text-2xl font-black uppercase leading-tight sm:text-3xl">{title || "Titular"}</h2>
          {excerpt ? <p className="mt-3 text-muted-foreground">{excerpt}</p> : null}
          <p className="mt-2 text-xs text-muted-foreground">{minutes} min de lectura</p>
          <div className="mt-6">
            <ArticleBody contentJson={contentJson} contentHtml={contentHtml} youtubeId={extractYoutubeId(youtubeId) || null} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
