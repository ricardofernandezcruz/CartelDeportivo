"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FileText,
  FolderTree,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Newspaper,
  Tags,
  UserCog,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

const nav: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  adminOnly?: boolean;
}[] = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/articulos", label: "Noticias", icon: Newspaper },
  { href: "/admin/articulos/nuevo", label: "Escribir", icon: FileText },
  { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
  { href: "/admin/autores", label: "Autores", icon: Users },
  { href: "/admin/etiquetas", label: "Etiquetas", icon: Tags },
  { href: "/admin/comentarios", label: "Comentarios", icon: MessageSquare },
  { href: "/admin/medios", label: "Medios", icon: Images },
  { href: "/admin/boletin", label: "Boletín", icon: Mail },
  { href: "/admin/usuarios", label: "Usuarios", icon: UserCog, adminOnly: true },
];

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
  WRITER: "Redactor",
};

export function AdminShell({
  children,
  userName,
  userRole,
}: {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider className="max-w-[100vw] overflow-x-hidden">
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border bg-gradient-to-br from-[var(--cartel-red)]/10 via-transparent to-[var(--cartel-blue)]/10">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--cartel-red)] to-[var(--cartel-blue)] font-heading text-xs font-black text-white shadow-sm">
              CD
            </span>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate font-heading text-sm font-black uppercase tracking-tight">Cartel Deportivo</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sala de redacción</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Trabajo diario</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => {
                  if (item.adminOnly && userRole !== "ADMIN") return null;
                  const active = item.exact
                    ? pathname === item.href
                    : pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href) && !(item.href === "/admin/articulos" && pathname.startsWith("/admin/articulos/nuevo")));
                  const isNuevo = item.href === "/admin/articulos/nuevo";
                  const isActive = isNuevo
                    ? pathname.startsWith("/admin/articulos/nuevo")
                    : item.href === "/admin/articulos"
                      ? pathname === "/admin/articulos" || /^\/admin\/articulos\/[^/]+$/.test(pathname)
                      : active;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        className={cn(isActive && "bg-[var(--cartel-red)]/10 text-[var(--cartel-red)]")}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <div className="rounded-xl bg-muted/50 px-3 py-2.5 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="text-xs text-muted-foreground">{roleLabel[userRole] ?? userRole}</p>
          </div>
          <Button
            variant="ghost"
            className="justify-start text-muted-foreground hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">Cerrar sesión</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-x-hidden bg-[#f7f7f8] dark:bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/80 bg-white/90 px-4 backdrop-blur dark:bg-background/90">
          <SidebarTrigger />
          <div className="flex-1" />
          <Link
            href="/"
            target="_blank"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver sitio
          </Link>
          <ThemeToggle />
        </header>
        <div className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
