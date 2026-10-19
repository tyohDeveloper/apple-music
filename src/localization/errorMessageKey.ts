// Interface key for an API or network failure code (keys under errors.* in the interface domain).
export function errorMessageKey(code: string): string {
  return `errors.${code}`;
}
