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
      <TopBar />
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
