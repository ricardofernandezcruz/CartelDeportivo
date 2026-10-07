"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteUserAction, saveUserAction } from "@/app/admin/usuarios/actions";
import type { UserRole } from "@prisma/client";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  WRITER: "Redactor",
};

export function UsersManager({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", email: "", password: "", role: "WRITER" as UserRole });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setError(null);
    setForm({ id: "", name: "", email: "", password: "", role: "WRITER" });
    setOpen(true);
  }

  function openEdit(user: UserRow) {
    setError(null);
    setForm({ id: user.id, name: user.name, email: user.email, password: "", role: user.role });
    setOpen(true);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await saveUserAction({
        id: form.id || undefined,
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        role: form.role,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function remove(user: UserRow) {
    if (!confirm(`¿Borrar a ${user.name}?`)) return;
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Acceso a la sala de redacción.</p>
        </div>
        <Button onClick={openNew} className="bg-[var(--cartel-red)] hover:bg-[var(--cartel-red)]/90">
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white dark:bg-card">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div>
              <p className="font-semibold">
                {user.name}
                {user.id === currentUserId && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(tú)</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{ROLE_LABEL[user.role]}</Badge>
              <Button type="button" size="sm" variant="outline" onClick={() => openEdit(user)}>
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                disabled={pending || user.id === currentUserId}
                onClick={() => remove(user)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
            <DialogDescription>
              {form.id ? "Deja la contraseña vacía para no cambiarla." : "El usuario podrá entrar al panel."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Nombre</Label>
              <Input id="user-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-email">Correo</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-pass">Contraseña {form.id ? "(opcional)" : ""}</Label>
              <Input
                id="user-pass"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => v && setForm({ ...form, role: v as UserRole })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="WRITER">Redactor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={pending} onClick={submit}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
