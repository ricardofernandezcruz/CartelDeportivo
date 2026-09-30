"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  label?: string;
  className?: string;
  aspectClassName?: string;
};

export function ImageUpload({
  value,
  onChange,
  onClear,
  label = "Imagen",
  className,
  aspectClassName = "aspect-[16/10]",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo subir la imagen");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Error de red al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
    e.target.value = "";
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        {value && onClear && (
          <Button type="button" variant="ghost" size="xs" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Quitar
          </Button>
        )}
      </div>

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void uploadFile(file);
        }}
        className={cn(
          "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition",
          aspectClassName,
          dragOver
            ? "border-[var(--cartel-red)] bg-[var(--cartel-red)]/5"
            : "border-border bg-muted/30 hover:border-[var(--cartel-blue)]/50 hover:bg-muted/50",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        {value ? (
          <Image src={value} alt="" fill className="object-cover" sizes="400px" unoptimized={value.startsWith("/")} />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center text-muted-foreground">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[var(--cartel-red)]" />
            ) : (
              <ImagePlus className="h-8 w-8 text-[var(--cartel-blue)]" />
            )}
            <p className="text-sm font-semibold text-foreground">
              {uploading ? "Subiendo…" : "Arrastra o haz clic para subir"}
            </p>
            <p className="text-xs">JPG, PNG, WebP · máx. 6 MB</p>
          </div>
        )}
        {value && !uploading && (
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[var(--cartel-blue)]/70 to-transparent pb-3 opacity-0 transition hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-foreground">
              <Upload className="h-3.5 w-3.5" />
              Cambiar imagen
            </span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
