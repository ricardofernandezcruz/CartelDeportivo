import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoVariant = "mark" | "full";

const sources: Record<LogoVariant, { src: string; width: number; height: number; alt: string }> = {
  mark: {
    src: "/brand/logo-mark.png",
    width: 280,
    height: 62,
    alt: "Cartel Deportivo",
  },
  full: {
    src: "/brand/logo.png",
    width: 280,
    height: 105,
    alt: "Cartel Deportivo — Lo más reciente del deporte",
  },
};

export function BrandLogo({
  className,
  priority,
  variant = "mark",
}: {
  className?: string;
  priority?: boolean;
  variant?: LogoVariant;
}) {
  const { src, width, height, alt } = sources[variant];

  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center justify-center", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          "h-auto w-auto object-contain",
          variant === "mark" && "max-h-[52px] max-w-[min(100vw-6rem,260px)] sm:max-h-[58px] sm:max-w-[280px]",
          variant === "full" && "max-w-[min(100%,300px)]",
        )}
      />
    </Link>
  );
}
