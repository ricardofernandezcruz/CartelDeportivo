import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionTitle({
  title,
  href,
  className,
}: {
  title: string;
  href?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-center gap-3", className)}>
      <h2 className="font-heading text-xl font-black uppercase tracking-tight text-[var(--cartel-blue)] sm:text-2xl">
        {title}
      </h2>
      <span className="h-0.5 flex-1 max-w-[120px] bg-gradient-to-r from-[var(--cartel-red)] to-[var(--cartel-blue)]" aria-hidden />
      {href && (
        <Link href={href} className="text-xs font-bold uppercase tracking-wider text-[var(--cartel-blue)] hover:underline">
          Ver más
        </Link>
      )}
    </div>
  );
}
