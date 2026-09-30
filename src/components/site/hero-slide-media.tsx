"use client";

import Image from "next/image";
import { useState } from "react";

export function HeroSlideMedia({ src, title }: { src?: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <>
      {showImage ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 520px"
          priority
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--cartel-red)] to-[var(--cartel-blue)]"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--cartel-blue)]/45 via-transparent to-transparent" />
      <span className="sr-only">{title}</span>
    </>
  );
}
