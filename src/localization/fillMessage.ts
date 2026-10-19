// Replaces {name} placeholders with values; unknown placeholders are left as written.
export function fillMessage(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{([A-Za-z0-9_]+)\}/gu, (placeholder, name: string) => values[name] ?? placeholder);
}
