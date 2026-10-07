"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { publicAvatarUrl } from "@/lib/media";
import { SiteImage } from "@/components/site/site-image";

/** Face position inside the cutout PNGs (they are not centered). */
const AVATAR_FOCUS: Record<string, string> = {
  "pappy-perez": "object-[68%_18%]",
  "tuto-tavarez": "object-[48%_16%]",
  "domingo-hernandez": "object-[50%_10%]",
  "rafael-baldayac": "object-[50%_10%]",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function ColumnistAvatar({
  src,
  name,
  slug,
  sizes = "128px",
  priority = false,
  className,
}: {
  src?: string | null;
  name: string;
  slug?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = publicAvatarUrl(src) ?? "";
  const show = Boolean(url) && !failed;
  const focus = (slug && AVATAR_FOCUS[slug]) || "object-[center_16%]";

  if (!show) {
    return (
      <span className="flex size-full items-center justify-center font-heading text-2xl font-black text-white">
        {initials(name)}
      </span>
    );
  }

  return (
    <SiteImage
      src={url}
      alt={name}
      fill
      sizes={sizes}
      priority={priority}
      quality={80}
      className={cn("object-cover", focus, className)}
      onError={() => setFailed(true)}
    />
  );
}
