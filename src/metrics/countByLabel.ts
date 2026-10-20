// Adds one to the counter for a label value without mutating the counters.
export function countByLabel(counts: Readonly<Record<string, number>>, value: string): Readonly<Record<string, number>> {
  return { ...counts, [value]: (counts[value] ?? 0) + 1 };
}
