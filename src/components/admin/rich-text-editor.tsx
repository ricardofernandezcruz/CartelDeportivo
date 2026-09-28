"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: object;
  onChange: (json: object, html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl my-5 max-w-full h-auto shadow-sm" } }),
      Placeholder.configure({
        placeholder: placeholder ?? "Empieza a escribir… Usa el botón de imagen para insertar fotos desde tu equipo.",
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

  async function uploadAndInsert(file: File) {
    if (!editor) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        window.alert(data.error ?? "No se pudo subir la imagen");
      }
    } catch {
      window.alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  if (!editor) return null;

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), label: "Negrita" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), label: "Cursiva" },
    { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), label: "Subrayado" },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), label: "Subtítulo" },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), label: "Lista" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), label: "Lista numerada" },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), label: "Cita" },
  ] as const;

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
          title="Subir imagen"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
        <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
          Tip: sube fotos desde tu PC con el icono de imagen
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
    </div>
  );
}
