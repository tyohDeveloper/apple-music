// A form field's trimmed text, or undefined when the field is absent or blank.
export function optionalField(values: Readonly<Record<string, string>>, name: string): string | undefined {
  const text = (values[name] ?? "").trim();
  return text === "" ? undefined : text;
}
