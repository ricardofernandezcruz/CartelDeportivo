import Link from "next/link";
import { SocialLinks } from "@/components/site/social-icons";

export function TopBar() {
  return (
    <div className="border-b border-border/60 bg-[var(--cartel-dark)] text-white">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 lg:px-6">
        <SocialLinks variant="dark" className="gap-1" />
        <Link
          href="/acerca"
          className="text-xs font-semibold uppercase tracking-wider text-white/90 hover:text-[var(--cartel-red)]"
        >
          Sobre nosotros
        </Link>
      </div>
    </div>
  );
}
