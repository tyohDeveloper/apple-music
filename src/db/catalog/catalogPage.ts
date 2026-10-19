// Paging shared by catalog lists: offsets are 0-indexed (§6); total counts every match.
export type PageRequest = { readonly query: string; readonly offset: number; readonly limit: number };
export type CatalogPage<T> = { readonly items: T[]; readonly total: number };
