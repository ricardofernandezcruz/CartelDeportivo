import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type AuthorInfo = {
  name: string;
  slug?: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function AuthorAvatar({
  author,
  size = "md",
  className,
}: {
  author: AuthorInfo;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const px = size === "sm" ? 36 : size === "lg" ? 72 : 48;
  const box =
    size === "sm" ? "h-9 w-9 text-xs" : size === "lg" ? "h-[72px] w-[72px] text-lg" : "h-12 w-12 text-sm";

  if (author.avatarUrl) {
    return (
      <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-full ring-2 ring-border", box, className)}>
        <Image
          src={author.avatarUrl}
          alt={author.name}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          unoptimized={author.avatarUrl.startsWith("/")}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--cartel-red)] to-[var(--cartel-blue)] font-bold text-white ring-2 ring-border",
        box,
        className,
      )}
      aria-hidden
    >
      {initials(author.name)}
    </span>
  );
}

/** Firma compacta (cabecera de noticia) */
export function AuthorByline({
  author,
  dateLabel,
  className,
}: {
  author: AuthorInfo;
  dateLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <AuthorAvatar author={author} size="sm" />
      <div className="min-w-0 leading-tight">
        <p className="text-sm font-semibold text-foreground">
          Por{" "}
          {author.slug ? (
            <Link href={`/autor/${author.slug}`} className="text-[var(--cartel-red)] hover:underline">
              {author.name}
            </Link>
          ) : (
            <span className="text-[var(--cartel-red)]">{author.name}</span>
          )}
        </p>
        {dateLabel && <p className="text-xs text-muted-foreground">{dateLabel}</p>}
      </div>
    </div>
  );
}

/** Bloque al final de la noticia */
export function AuthorCard({ author, className }: { author: AuthorInfo; className?: string }) {
  const inner = (
    <>
      <AuthorAvatar author={author} size="lg" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Escrito por</p>
        <p className="mt-1 font-heading text-xl font-black uppercase tracking-tight text-foreground">
          {author.name}
        </p>
        {author.bio ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{author.bio}</p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Redacción · Cartel Deportivo</p>
        )}
        {author.slug && (
          <p className="mt-3 text-sm font-semibold text-[var(--cartel-blue)] group-hover:text-[var(--cartel-red)]">
            Ver perfil y notas
          </p>
        )}
      </div>
    </>
  );

  const box = cn(
    "flex gap-4 rounded-2xl border border-border bg-muted/30 p-5 sm:gap-5 sm:p-6",
    author.slug && "group transition hover:border-[var(--cartel-blue)]/40 hover:bg-muted/50",
    className,
  );

  if (author.slug) {
    return (
      <Link href={`/autor/${author.slug}`} className={box}>
        {inner}
      </Link>
    );
  }

  return <aside className={box}>{inner}</aside>;
}
