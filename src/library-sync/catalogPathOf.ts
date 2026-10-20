// The request path that looks up catalog songs or albums by id in a storefront, ids separated
// by commas (docs/design/apple-music-import.md: at most 300 songs or 100 albums a request).
export type CatalogKind = "song" | "album";

export function catalogPathOf(storefront: string, kind: CatalogKind, ids: readonly string[]): string {
  return `/v1/catalog/${encodeURIComponent(storefront)}/${kind}s?ids=${ids.map(encodeURIComponent).join(",")}`;
}
