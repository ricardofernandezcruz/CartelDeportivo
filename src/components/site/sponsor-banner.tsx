import Image from "next/image";
import Link from "next/link";

export function SponsorBanner({ href = "#", label = "ACAP" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-md border border-border/60 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative flex h-[72px] items-center justify-center bg-muted/30 sm:h-[90px]">
        <Image
          src="/brand/sponsor-acap.webp"
          alt={label}
          width={728}
          height={90}
          className="h-full w-auto max-w-full object-contain px-4 transition group-hover:scale-[1.01]"
        />
      </div>
    </Link>
  );
}
