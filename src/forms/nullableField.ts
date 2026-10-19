// A form field's trimmed text, or null when the field is blank (null clears a stored value).
import { optionalField } from "./optionalField.ts";

export function nullableField(values: Readonly<Record<string, string>>, name: string): string | null {
  return optionalField(values, name) ?? null;
}
