// Items split, in order, into consecutive batches of at most `size` (at least 1).
export function batchesOf<T>(items: readonly T[], size: number): T[][] {
  const step = Math.max(1, Math.floor(size));
  const batches: T[][] = [];
  for (let start = 0; start < items.length; start += step) batches.push(items.slice(start, start + step));
  return batches;
}
