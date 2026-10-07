import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
};

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "No autenticado", user: null };
  }
  return { ok: true as const, error: null, user: session.user as SessionUser };
}

export async function requireEditor() {
  const authz = await requireUser();
  if (!authz.ok) return authz;
  if (authz.user.role === "WRITER") {
    return { ok: false as const, error: "Tu rol no puede gestionar este catálogo", user: null };
  }
  return authz;
}

export async function requireAdmin() {
  const authz = await requireUser();
  if (!authz.ok) return authz;
  if (authz.user.role !== "ADMIN") {
    return { ok: false as const, error: "Solo un administrador puede hacer esto", user: null };
  }
  return authz;
}
