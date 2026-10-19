// Trims and collapses runs of whitespace to one space; the single normalization for
// names and labels typed by a person.
export function collapseWhitespace(text: string): string {
  return text.trim().replace(/\s+/gu, " ");
}
