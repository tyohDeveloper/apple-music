// Adds one response to the per-status-class counters (1xx … 5xx) without mutating them.
export function countStatusClass(
  counts: Readonly<Record<string, number>>,
  statusCode: number,
): Readonly<Record<string, number>> {
  const statusClass = `${Math.floor(statusCode / 100)}xx`;
  return { ...counts, [statusClass]: (counts[statusClass] ?? 0) + 1 };
}
