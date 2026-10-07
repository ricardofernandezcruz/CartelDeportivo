"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";
import { SiteImage } from "@/components/site/site-image";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  label?: string;
  className?: string;
  aspectClassName?: string;
  focalX?: number;
  focalY?: number;
  onFocalChange?: (x: number, y: number) => void;
};

export function ImageUpload({
  value,
  onChange,
  onClear,
  label = "Imagen",
  className,
  aspectClassName = "aspect-[16/10]",
  focalX = 50,
  focalY = 50,
  onFocalChange,
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
      const raw = await res.text();
      let data: { url?: string; error?: string } = {};
      try {
        data = JSON.parse(raw) as { url?: string; error?: string };
      } catch {
        setError(res.ok ? "Respuesta inválida del servidor" : `Error ${res.status} al subir`);
        return;
      }
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
        <div className="flex items-center gap-1">
          <MediaPicker onPick={onChange} />
          {value && onClear && (
            <Button type="button" variant="ghost" size="xs" onClick={onClear}>
              <Trash2 className="h-3.5 w-3.5" />
              Quitar
            </Button>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={uploading}
        onClick={(e) => {
          if (value && onFocalChange) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
            const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
            onFocalChange(Math.round(x), Math.round(y));
            return;
          }
          inputRef.current?.click();
        }}
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
          <SiteImage
            src={value}
            alt=""
            fill
            className="pointer-events-none object-cover"
            style={{ objectPosition: `${focalX}% ${focalY}%` }}
            sizes="400px"
          />
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
            <p className="text-xs">JPG, PNG, WebP, AVIF · máx. 4 MB · se convierte a WebP</p>
          </div>
        )}
        {value && !uploading && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                inputRef.current?.click();
              }
            }}
            className="absolute bottom-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm"
          >
            <Upload className="h-3.5 w-3.5" />
            Cambiar imagen
          </span>
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
      {value && onFocalChange && (
        <p className="text-[11px] text-muted-foreground">
          Clic en la foto para el punto de recorte ({focalX}%, {focalY}%).
        </p>
      )}
    </div>
  );
}
