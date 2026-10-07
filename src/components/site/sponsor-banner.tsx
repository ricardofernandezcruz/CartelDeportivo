import Image from "next/image";

export function SponsorBanner({ label = "ACAP" }: { href?: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-border/60 bg-white shadow-sm">
      <div className="relative flex h-[72px] items-center justify-center bg-muted/30 sm:h-[90px]">
        <Image
          src="/brand/sponsor-acap.webp"
          alt={`Patrocinador ${label}`}
          width={728}
          height={90}
          className="h-full w-auto max-w-full object-contain px-4"
        />
      </div>
    </div>
  );
}
