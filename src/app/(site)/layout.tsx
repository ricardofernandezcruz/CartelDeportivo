import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TopBar } from "@/components/site/top-bar";
import { getAllCategories } from "@/lib/articles";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  let categories: { name: string; slug: string }[] | undefined;
  try {
    const rows = await getAllCategories();
    categories = rows.map((c) => ({ name: c.name, slug: c.slug }));
  } catch {
    categories = undefined;
  }

  return (
    <div className="flex min-h-full flex-col bg-white dark:bg-background">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--cartel-red)] focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Saltar al contenido
      </a>
      <TopBar />
      <SiteHeader categories={categories} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
