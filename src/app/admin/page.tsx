import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, FilePlus2, FileText, Newspaper, Pencil } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  PUBLISHED: "Publicada",
  DRAFT: "Borrador",
  REVIEW: "Revisión",
  SCHEDULED: "Programada",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  const [published, drafts, review, views, recent] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "REVIEW" } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { category: true, author: true },
    }),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "equipo";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  const stats = [
    {
      label: "Publicadas",
      value: published,
      hint: "En el sitio ahora",
      color: "from-[var(--cartel-red)] to-rose-600",
      icon: Newspaper,
    },
    {
      label: "Borradores",
      value: drafts,
      hint: "Pendientes de terminar",
      color: "from-amber-500 to-orange-600",
      icon: FileText,
    },
    {
      label: "En revisión",
      value: review,
      hint: "Esperando editor",
      color: "from-[var(--cartel-blue)] to-sky-600",
      icon: Pencil,
    },
    {
      label: "Vistas totales",
      value: views._sum.viewCount ?? 0,
      hint: "Acumulado en demo",
      color: "from-emerald-500 to-teal-600",
      icon: Eye,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--cartel-dark)] via-[#1f1f22] to-[var(--cartel-blue)] p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--cartel-red)]/30 blur-3xl" />
        <div className="absolute -bottom-16 right-20 h-48 w-48 rounded-full bg-[var(--cartel-blue)]/40 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">{greeting}</p>
            <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Hola, {firstName}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
              Escribe, sube fotos desde tu PC y publica. La portada, el SEO y la búsqueda se actualizan solos.
            </p>
          </div>
          <Link
            href="/admin/articulos/nuevo"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white text-[var(--cartel-dark)] hover:bg-white/90",
            )}
          >
            <FilePlus2 className="h-4 w-4" />
            Nueva noticia
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, hint, color, icon: Icon }) => (
          <div
            key={label}
            className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card"
          >
            <div className={cn("h-1.5 bg-gradient-to-r", color)} />
            <div className="flex items-start justify-between p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-black tabular-nums tracking-tight">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </div>
              <span className={cn("rounded-xl bg-gradient-to-br p-2.5 text-white shadow-sm", color)}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-black uppercase">Actividad reciente</h2>
            <p className="text-xs text-muted-foreground">Últimas notas editadas por la redacción</p>
          </div>
          <Link
            href="/admin/articulos"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--cartel-blue)] hover:underline"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.map((article) => (
            <Link
              key={article.id}
              href={`/admin/articulos/${article.id}`}
              className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-muted/40"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {article.heroImageUrl ? (
                  <Image
                    src={article.heroImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={article.heroImageUrl.startsWith("/")}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">Sin foto</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-snug">{article.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {article.category.name} · {article.author.name} · {formatRelativeDate(article.updatedAt)}
                </p>
              </div>
              <Badge
                variant={article.status === "PUBLISHED" ? "default" : "secondary"}
                className={cn(article.status === "PUBLISHED" && "bg-[var(--cartel-red)]")}
              >
                {statusLabel[article.status] ?? article.status}
              </Badge>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
