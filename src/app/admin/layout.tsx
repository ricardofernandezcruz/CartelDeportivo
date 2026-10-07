import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();

  return (
    <AdminShell userName={session?.user?.name ?? "Invitado"} userRole={session?.user?.role ?? "WRITER"}>
      {children}
    </AdminShell>
  );
}
