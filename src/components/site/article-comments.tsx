"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeDate } from "@/lib/format";

export type PublicComment = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
};

export function ArticleComments({
  articleId,
  comments,
}: {
  articleId: string;
  comments: PublicComment[];
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="font-heading text-2xl font-black uppercase">Comentarios</h2>
      {comments.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Sé el primero en comentar esta nota.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-bold">{c.name}</p>
              <p className="text-[11px] text-muted-foreground">{formatRelativeDate(c.createdAt)}</p>
              <p className="mt-2 text-sm leading-relaxed">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {done ? (
        <p className="mt-6 text-sm font-semibold text-[var(--cartel-blue)]">
          Recibido. Lo publicamos cuando pase revisión.
        </p>
      ) : (
        <form
          className="mt-6 space-y-3 rounded-xl border border-border p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setPending(true);
            try {
              const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ articleId, name, body }),
              });
              const data = (await res.json()) as { error?: string };
              if (!res.ok) {
                setError(data.error ?? "No se pudo enviar");
                return;
              }
              setDone(true);
              setName("");
              setBody("");
            } catch {
              setError("Error de red");
            } finally {
              setPending(false);
            }
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deja tu comentario</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required maxLength={80} />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tu opinión, con respeto"
            rows={4}
            required
            maxLength={1200}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Enviando…" : "Enviar a revisión"}
          </Button>
        </form>
      )}
    </section>
  );
}
