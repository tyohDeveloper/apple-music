// A comma-separated form field as a list of trimmed, non-blank entries.
export function listField(values: Readonly<Record<string, string>>, name: string): string[] {
  return (values[name] ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");
}
