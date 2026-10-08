"use client";

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Heading2,
  ImageIcon,
  Images,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Underline as UnderlineIcon,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { parseEmbed, embedLabel } from "@/lib/embed";
import { ArticleImage, ImageGallery, PullQuote, VideoEmbed } from "@/components/admin/article-nodes";
import { MediaPicker } from "@/components/admin/media-picker";

function PullQuoteView({ node }: ReactNodeViewProps) {
  const text = String(node.attrs.text ?? "").trim();
  const attribution = String(node.attrs.attribution ?? "").trim();
  return (
    <NodeViewWrapper>
      <blockquote className="my-6 rounded-2xl border-l-4 border-[var(--cartel-red)] bg-[var(--cartel-blue)]/5 px-6 py-5">
        <p className="font-heading text-xl font-bold leading-snug">{text || "Cita destacada"}</p>
        {attribution ? (
          <cite className="mt-2 block text-sm not-italic text-muted-foreground">— {attribution}</cite>
        ) : null}
      </blockquote>
    </NodeViewWrapper>
  );
}

function VideoEmbedView({ node }: ReactNodeViewProps) {
  const parsed = parseEmbed(String(node.attrs.embedId ?? "") || String(node.attrs.url ?? ""));
  const label = parsed ? embedLabel(parsed.provider) : "Video";
  return (
    <NodeViewWrapper>
      <div className="my-4 overflow-hidden rounded-xl border border-border bg-muted/40">
        {parsed?.provider === "youtube" && parsed.id ? (
          <div className="relative aspect-video bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover opacity-90"
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white">
              {label}
            </span>
          </div>
        ) : (
          <p className="px-4 py-3 text-sm">
            {label}
            {parsed?.url ? `: ${parsed.url}` : ""}
          </p>
        )}
      </div>
    </NodeViewWrapper>
  );
}

type RichTextEditorProps = {
  value: object;
  onChange: (json: object, html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState({ alt: "", credit: "", caption: "" });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<Array<{ src: string; alt: string; caption: string }>>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quote, setQuote] = useState({ text: "", attribution: "" });
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl my-5 max-w-full h-auto shadow-sm" } }),
      ArticleImage,
      ImageGallery,
      PullQuote.extend({
        addNodeView() {
          return ReactNodeViewRenderer(PullQuoteView);
        },
      }),
      VideoEmbed.extend({
        addNodeView() {
          return ReactNodeViewRenderer(VideoEmbedView);
        },
      }),
      Placeholder.configure({
        placeholder:
          placeholder ?? "Párrafos, subtítulos, cita destacada, imagen o video pegando el link.",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-[380px] px-5 py-4 focus:outline-none prose-headings:font-heading prose-headings:uppercase",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON(), ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(value);
    if (current !== incoming && Object.keys(value).length > 0) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  async function uploadFile(file: File) {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) throw new Error(data.error ?? "No se pudo subir la imagen");
    return data.url;
  }

  async function uploadAndInsert(file: File) {
    if (!editor) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setPendingImage(url);
      setImageMeta({ alt: "", credit: "", caption: "" });
    } catch {
      window.alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  function confirmImage() {
    if (!editor || !pendingImage) return;
    if (!imageMeta.alt.trim() || !imageMeta.caption.trim()) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "articleImage",
        attrs: {
          src: pendingImage,
          alt: imageMeta.alt.trim(),
          credit: imageMeta.credit.trim(),
          caption: imageMeta.caption.trim(),
        },
      })
      .run();
    setPendingImage(null);
  }

  function confirmQuote() {
    if (!editor || !quote.text.trim() || !quote.attribution.trim()) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "pullQuote",
        attrs: { text: quote.text.trim(), attribution: quote.attribution.trim(), featured: true },
      })
      .run();
    setQuote({ text: "", attribution: "" });
    setQuoteOpen(false);
  }

  function confirmVideo() {
    const parsed = parseEmbed(videoUrl);
    if (!parsed) {
      setVideoError("Pega un link de YouTube, Shorts, TikTok, Instagram o X.");
      return;
    }
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: "videoEmbed",
        attrs: { url: parsed.url, provider: parsed.provider, embedId: parsed.id },
      })
      .run();
    setVideoUrl("");
    setVideoError(null);
    setVideoOpen(false);
  }

  async function uploadGallery(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    try {
      const next: Array<{ src: string; alt: string; caption: string }> = [];
      for (const file of Array.from(files).slice(0, 8)) {
        next.push({ src: await uploadFile(file), alt: "", caption: "" });
      }
      setGalleryItems(next);
      setGalleryOpen(true);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al subir la galería");
    } finally {
      setUploading(false);
    }
  }

  function confirmGallery() {
    if (!editor || galleryItems.length < 2) return;
    if (galleryItems.some((img) => !img.alt.trim())) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "imageGallery",
        attrs: { images: galleryItems.map((img) => ({ src: img.src, alt: img.alt.trim(), caption: img.caption.trim() })) },
      })
      .run();
    setGalleryItems([]);
    setGalleryOpen(false);
  }

  if (!editor) return null;

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), label: "Negrita" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), label: "Cursiva" },
    { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), label: "Subrayado" },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), label: "Subtítulo" },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), label: "Lista" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), label: "Lista numerada" },
  ] as const;

  const imageReady = Boolean(imageMeta.alt.trim() && imageMeta.caption.trim());

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-gradient-to-r from-muted/60 to-muted/20 p-2">
        {tools.map(({ icon: Icon, action, active, label }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon-sm"
            title={label}
            className={cn(active && "bg-background shadow-sm")}
            onClick={action}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Cita destacada"
          className={cn(editor.isActive("pullQuote") && "bg-background shadow-sm")}
          onClick={() => setQuoteOpen(true)}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Insertar enlace"
          onClick={() => {
            const url = window.prompt("URL del enlace");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Imagen (alt y pie de foto)"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
        <MediaPicker
          onPick={(url) => {
            setPendingImage(url);
            setImageMeta({ alt: "", credit: "", caption: "" });
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Galería (2 a 8 fotos)"
          disabled={uploading}
          onClick={() => galleryRef.current?.click()}
        >
          <Images className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Video (YouTube, Shorts, TikTok, Instagram, X)"
          onClick={() => setVideoOpen(true)}
        >
          <Video className="h-4 w-4" />
        </Button>
        <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
          Bloques: párrafo, subtítulo, imagen, galería, video, cita
        </span>
      </div>
      <EditorContent editor={editor} />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadAndInsert(file);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void uploadGallery(e.target.files);
          e.target.value = "";
        }}
      />

      <Dialog open={Boolean(pendingImage)} onOpenChange={(open) => !open && setPendingImage(null)}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Datos de la imagen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">El texto alt y el pie de foto son obligatorios. El crédito es opcional.</p>
            <div className="space-y-1.5">
              <Label htmlFor="img-alt">Texto alternativo</Label>
              <Input
                id="img-alt"
                value={imageMeta.alt}
                onChange={(e) => setImageMeta((m) => ({ ...m, alt: e.target.value }))}
                placeholder="Qué se ve en la foto"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="img-credit">Crédito (opcional)</Label>
              <Input
                id="img-credit"
                value={imageMeta.credit}
                onChange={(e) => setImageMeta((m) => ({ ...m, credit: e.target.value }))}
                placeholder="Fotógrafo o agencia"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="img-caption">Pie de foto</Label>
              <Input
                id="img-caption"
                value={imageMeta.caption}
                onChange={(e) => setImageMeta((m) => ({ ...m, caption: e.target.value }))}
                placeholder="Leyenda que verá el lector"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingImage(null)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!imageReady} onClick={confirmImage}>
              Insertar imagen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Cita destacada</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="quote-text">Texto</Label>
              <Textarea
                id="quote-text"
                rows={3}
                value={quote.text}
                onChange={(e) => setQuote((q) => ({ ...q, text: e.target.value }))}
                placeholder="Lo que dijo"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quote-who">Quién lo dijo</Label>
              <Input
                id="quote-who"
                value={quote.attribution}
                onChange={(e) => setQuote((q) => ({ ...q, attribution: e.target.value }))}
                placeholder="Nombre y cargo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setQuoteOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!quote.text.trim() || !quote.attribution.trim()}
              onClick={confirmQuote}
            >
              Insertar cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Galería</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">Mínimo 2 fotos. El alt es obligatorio en cada una.</p>
          <div className="space-y-3">
            {galleryItems.map((img, i) => (
              <div key={img.src} className="space-y-1.5 rounded-lg border border-border p-3">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">Foto {i + 1}</p>
                <Input
                  value={img.alt}
                  onChange={(e) =>
                    setGalleryItems((rows) => rows.map((row, idx) => (idx === i ? { ...row, alt: e.target.value } : row)))
                  }
                  placeholder="Texto alt"
                />
                <Input
                  value={img.caption}
                  onChange={(e) =>
                    setGalleryItems((rows) =>
                      rows.map((row, idx) => (idx === i ? { ...row, caption: e.target.value } : row)),
                    )
                  }
                  placeholder="Pie (opcional)"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setGalleryOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={galleryItems.length < 2 || galleryItems.some((img) => !img.alt.trim())}
              onClick={confirmGallery}
            >
              Insertar galería
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Insertar video</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="video-url">Link</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setVideoError(null);
                }}
                placeholder="YouTube, Shorts, TikTok, Instagram o X"
              />
            </div>
            {videoUrl && parseEmbed(videoUrl) && (
              <p className="text-xs text-muted-foreground">
                Detectado: {embedLabel(parseEmbed(videoUrl)!.provider)}
              </p>
            )}
            {videoError && <p className="text-xs text-destructive">{videoError}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setVideoOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={confirmVideo}>
              Insertar video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
