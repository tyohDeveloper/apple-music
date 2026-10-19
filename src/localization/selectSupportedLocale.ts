// Picks the first requested language that is supported, matching on the primary
// subtag when the full tag is not supported; falls back to the base locale.
export function selectSupportedLocale(
  requested: readonly string[],
  supported: readonly string[],
  base: string,
): string {
  for (const tag of requested) {
    const lower = tag.toLowerCase();
    const exact = supported.find((code) => code.toLowerCase() === lower);
    if (exact !== undefined) return exact;
    const primary = supported.find((code) => code.toLowerCase() === lower.split("-")[0]);
    if (primary !== undefined) return primary;
  }
  return base;
}
