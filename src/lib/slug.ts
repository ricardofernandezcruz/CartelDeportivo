import slugifyLib from "slugify";

export function toSlug(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, locale: "es" });
}
