"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setCommentStatusAction } from "@/app/admin/comentarios/actions";
import type { CommentStatus } from "@prisma/client";

type Row = {
  id: string;
  name: string;
  body: string;
  status: CommentStatus;
  createdAt: string;
  articleTitle: string;
  articleSlug: string;
};

export function CommentsManager({ comments, canModerate }: { comments: Row[]; canModerate: boolean }) {
  const [pending, start] = useTransition();

  function setStatus(id: string, status: CommentStatus) {
    start(async () => {
      await setCommentStatusAction(id, status);
    });
  }

  if (!comments.length) {
    return <p className="text-sm text-muted-foreground">No hay comentarios todavía.</p>;
  }

  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li key={c.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold">{c.name}</p>
            <Badge variant={c.status === "APPROVED" ? "default" : c.status === "REJECTED" ? "destructive" : "secondary"}>
              {c.status === "APPROVED" ? "Aprobado" : c.status === "REJECTED" ? "Rechazado" : "Pendiente"}
            </Badge>
          </div>
          <Link href={`/noticia/${c.articleSlug}`} className="mt-1 block text-xs text-[var(--cartel-blue)] hover:underline">
            {c.articleTitle}
          </Link>
          <p className="mt-2 text-sm leading-relaxed">{c.body}</p>
          {canModerate && c.status === "PENDING" && (
            <div className="mt-3 flex gap-2">
              <Button type="button" size="xs" disabled={pending} onClick={() => setStatus(c.id, "APPROVED")}>
                Aprobar
              </Button>
              <Button type="button" size="xs" variant="outline" disabled={pending} onClick={() => setStatus(c.id, "REJECTED")}>
                Rechazar
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
