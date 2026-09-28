import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute =
    req.nextUrl.pathname.startsWith("/admin") &&
    !req.nextUrl.pathname.startsWith("/admin/login");

  if (isAdminRoute && !req.auth) {
    const login = new URL("/admin/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
