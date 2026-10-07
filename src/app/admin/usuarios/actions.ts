"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  email: z.string().trim().email("Correo inválido"),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "EDITOR", "WRITER"]),
});

export async function saveUserAction(input: z.infer<typeof userSchema>) {
  const authz = await requireAdmin();
  if (!authz.ok) return { ok: false as const, error: authz.error };

  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  if (!data.id && (!data.password || data.password.length < 6)) {
    return { ok: false as const, error: "La contraseña debe tener al menos 6 caracteres" };
  }
  if (data.id && data.password && data.password.length < 6) {
    return { ok: false as const, error: "La nueva contraseña debe tener al menos 6 caracteres" };
  }

  const clash = await prisma.user.findFirst({
    where: { email, NOT: data.id ? { id: data.id } : undefined },
    select: { id: true },
  });
  if (clash) return { ok: false as const, error: "Ya existe un usuario con ese correo" };

  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

  if (data.id) {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email,
        role: data.role as UserRole,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });
  } else {
    await prisma.user.create({
      data: {
        name: data.name,
        email,
        role: data.role as UserRole,
        passwordHash: passwordHash!,
      },
    });
  }

  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}

export async function deleteUserAction(id: string) {
  const authz = await requireAdmin();
  if (!authz.ok) return { ok: false as const, error: authz.error };
  if (authz.user.id === id) {
    return { ok: false as const, error: "No puedes borrar tu propio usuario" };
  }

  const admins = await prisma.user.count({ where: { role: "ADMIN" } });
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return { ok: false as const, error: "Usuario no encontrado" };
  if (target.role === "ADMIN" && admins <= 1) {
    return { ok: false as const, error: "Debe quedar al menos un administrador" };
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}
