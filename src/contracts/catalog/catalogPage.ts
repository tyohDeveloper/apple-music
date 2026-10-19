// The body of every catalog list response: one page of items and the number of matches.
export type CatalogPage<T> = { readonly items: readonly T[]; readonly total: number };
