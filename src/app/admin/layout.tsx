import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();

  return (
    <AdminShell userName={session?.user?.name ?? "Invitado"} userRole={session?.user?.role ?? "writer"}>
      {children}
    </AdminShell>
  );
}
