// Where the next page of a library list starts: the `offset` of Apple's `next` subpath, or
// "done" when there is no `next`. Only the offset is taken, so a `next` naming another host or
// path is never followed. "malformed" when `next` has no whole-number offset beyond the
// current one, which would otherwise page forever.
export function nextOffsetOf(next: string | null, current: number): number | "done" | "malformed" {
  if (next === null) return "done";
  const query = next.includes("?") ? next.slice(next.indexOf("?") + 1) : "";
  const offset = new URLSearchParams(query).get("offset") ?? "";
  if (!/^\d{1,9}$/u.test(offset)) return "malformed";
  const value = Number(offset);
  return value > current ? value : "malformed";
}
