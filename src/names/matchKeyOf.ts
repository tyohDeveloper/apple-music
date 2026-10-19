// The form of a name used to match it against other spellings: compatibility-decomposed,
// without combining marks, lower-cased, and with each run of characters that are neither
// letters nor digits reduced to one space. "Beyoncé" and "BEYONCE" share a key; so do
// "Guns N' Roses" and "Guns N Roses".
export function matchKeyOf(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
