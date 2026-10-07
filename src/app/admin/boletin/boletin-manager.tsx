"use client";

import { useState, useTransition } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSubscriberAction, sendDigestAction } from "@/app/admin/boletin/actions";

type Row = { id: string; email: string; createdAt: string };

export function BoletinManager({
  subscribers,
  canSend,
}: {
  subscribers: Row[];
  canSend: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {canSend && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            disabled={pending || subscribers.length === 0}
            className="bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90"
            onClick={() => {
              setMsg(null);
              start(async () => {
                const result = await sendDigestAction();
                setMsg(result.ok ? `Enviado a ${result.sent} correos.` : result.error);
              });
            }}
          >
            <Send className="h-4 w-4" />
            Enviar titulares de hoy
          </Button>
          <p className="text-xs text-muted-foreground">Usa Resend. Sin API key, el alta igual se guarda.</p>
        </div>
      )}
      {msg && <p className="text-sm font-medium">{msg}</p>}
      {subscribers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nadie se ha suscrito todavía.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {subscribers.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium">{s.email}</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(s.createdAt).toLocaleString("es-DO")}
                </p>
              </div>
              {canSend && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      await deleteSubscriberAction(s.id);
                    });
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
