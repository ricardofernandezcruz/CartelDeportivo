import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware ligero: solo auth.config (sin Prisma).
 * Evita el límite de 1 MB de Edge Functions en Vercel Hobby.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
