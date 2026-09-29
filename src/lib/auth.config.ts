import type { NextAuthConfig } from "next-auth";

/**
 * Config Edge-compatible (sin Prisma/bcrypt) para middleware en Vercel.
 * El provider Credentials con DB vive en auth.ts (Node runtime).
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const isAdminRoute = path.startsWith("/admin") && !path.startsWith("/admin/login");
      if (isAdminRoute) return isLoggedIn;
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "EDITOR" | "WRITER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
