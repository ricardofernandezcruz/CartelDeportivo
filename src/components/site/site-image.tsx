import Image, { type ImageProps } from "next/image";
import { deliveryImageUrl, unoptimizedImage } from "@/lib/media";

export function SiteImage({ src, unoptimized, ...props }: ImageProps) {
  const resolved = typeof src === "string" ? deliveryImageUrl(src) : src;
  const skip =
    unoptimized ?? (typeof resolved === "string" ? unoptimizedImage(resolved) : undefined);
  return <Image src={resolved} unoptimized={skip} {...props} />;
}
