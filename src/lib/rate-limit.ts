type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  { max = 8, windowMs = 15 * 60_000 }: { max?: number; windowMs?: number } = {},
) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: max - 1, retryAt: now + windowMs };
  }
  if (current.count >= max) {
    return { ok: false as const, remaining: 0, retryAt: current.resetAt };
  }
  current.count += 1;
  return { ok: true as const, remaining: max - current.count, retryAt: current.resetAt };
}

export function clientIpFromHeaders(headersList: Headers) {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headersList.get("x-real-ip")?.trim() || "local";
}
