"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin");

  if (!email || !password) {
    return { error: "Correo y contraseña son obligatorios." };
  }

  const ip = clientIpFromHeaders(await headers());
  const limited = rateLimit(`login:${ip}:${email}`);
  if (!limited.ok) {
    return { error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectTo.startsWith("/") ? redirectTo : "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Credenciales incorrectas. Usa editor@carteldeportivo.com / demo1234" };
      }
      return { error: "No se pudo iniciar sesión. Revisa que Postgres esté activo (npm run db:up)." };
    }
    throw error;
  }

  return { error: null };
}
