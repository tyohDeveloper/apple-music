// An entered external identifier as stored: trimmed and normalized as its namespace says,
// or null when the entity does not take the namespace or the value lacks its form.
import { externalIdFormatOf, type ExternalIdNormalization, type ExternalIdOwner } from "./externalIdFormatOf.ts";

const steps: Readonly<Record<ExternalIdNormalization, (value: string) => string>> = {
  "remove-separators": (value) => value.replace(/[\s-]+/gu, ""),
  "upper-case": (value) => value.toUpperCase(),
  "lower-case": (value) => value.toLowerCase(),
};

export function normalizedExternalIdOf(owner: ExternalIdOwner, namespace: string, value: string): string | null {
  const format = externalIdFormatOf(owner, namespace);
  if (format === undefined) return null;
  const normalized = format.normalize.reduce((text, step) => steps[step](text), value.trim());
  return new RegExp(format.pattern, "u").test(normalized) ? normalized : null;
}
