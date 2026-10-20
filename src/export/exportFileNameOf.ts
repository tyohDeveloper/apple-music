// The download name of a library export: the library's label as lower-case ASCII letters and
// digits joined by hyphens, accents dropped, at most 60 characters ("library" when nothing is
// left), then the UTC day of the snapshot. "Mötley Crüe & Co" exported on 2026-10-20 at
// any hour UTC is motley-crue-co-2026-10-20.json.
export function exportFileNameOf(label: string, exportedAt: string): string {
  const ascii = label.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase();
  const stem = ascii.replace(/[^a-z0-9]+/gu, "-").replace(/^-+/u, "").slice(0, 60).replace(/-+$/u, "");
  return `${stem === "" ? "library" : stem}-${exportedAt.slice(0, 10)}.json`;
}
