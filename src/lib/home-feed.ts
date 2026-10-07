export function takeUnused<T extends { id: string }>(used: Set<string>, items: T[], n: number) {
  const out: T[] = [];
  for (const item of items) {
    if (used.has(item.id)) continue;
    used.add(item.id);
    out.push(item);
    if (out.length >= n) break;
  }
  return out;
}
