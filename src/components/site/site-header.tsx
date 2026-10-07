"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "@/components/site/brand-logo";
import { cn } from "@/lib/utils";

type NavCategory = { name: string; slug: string };

const defaultNav: NavCategory[] = [
  { name: "Béisbol", slug: "beisbol" },
  { name: "Baloncesto", slug: "baloncesto" },
  { name: "Boxeo", slug: "boxeo" },
  { name: "Fútbol", slug: "futbol" },
];

export function SiteHeader({ categories = defaultNav }: { categories?: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const [otrosOpen, setOtrosOpen] = useState(false);

  const navItems = categories.filter((c) => c.slug !== "");

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm dark:bg-background">
      {/* Marca: altura automática para que el PNG no invada el menú */}
      <div className="border-b border-border/60">
        <div className="mx-auto grid max-w-7xl grid-cols-[2.75rem_1fr_2.75rem] items-center gap-x-2 px-4 py-3 sm:grid-cols-[3rem_1fr_3rem] sm:px-6 sm:py-3.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="justify-self-start lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="hidden lg:block" aria-hidden />

          <div className="flex min-h-[52px] items-center justify-center overflow-hidden py-0.5">
            <BrandLogo priority variant="mark" />
          </div>

          <Link
            href="/buscar"
            title="Buscar"
            aria-label="Buscar"
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "justify-self-end")}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Link>
        </div>
        <p className="pb-2 text-center font-[family-name:var(--font-heading)] text-[11px] font-medium italic text-foreground/70 sm:text-xs">
          Lo más reciente del deporte
        </p>
      </div>

      <nav className="hidden border-b border-border/80 bg-white lg:block dark:bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-0.5 gap-y-1 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="px-2.5 py-1 text-[13px] font-bold uppercase tracking-wide text-foreground/85 hover:text-[var(--cartel-red)] xl:px-3 xl:text-sm"
          >
            Inicio
          </Link>
          {navItems.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="px-2.5 py-1 text-[13px] font-bold uppercase tracking-wide text-foreground/85 hover:text-[var(--cartel-red)] xl:px-3 xl:text-sm"
            >
              {cat.name}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 text-[13px] font-bold uppercase tracking-wide text-foreground/85 hover:text-[var(--cartel-red)] xl:px-3 xl:text-sm"
              onClick={() => setOtrosOpen((v) => !v)}
            >
              Otros deportes
              <ChevronDown className="h-4 w-4" />
            </button>
            {otrosOpen && (
              <div className="absolute left-0 top-full z-50 min-w-[160px] rounded-md border border-border bg-popover py-1 shadow-lg">
                <Link
                  href="/categoria/motor"
                  className="block px-4 py-2 text-sm font-semibold hover:bg-muted"
                  onClick={() => setOtrosOpen(false)}
                >
                  Motor
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              <Link href="/" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-bold uppercase hover:bg-muted">
                Inicio
              </Link>
              {navItems.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-bold uppercase text-foreground/80 hover:bg-muted"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/categoria/motor" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-bold uppercase hover:bg-muted">
                Motor
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
