// Actions of a searchable, paged catalog list (performers, recordings, albums) and of the
// creation form beside it. Actions that carry no items are typed for any item type.
import type { CatalogPage } from "../../../contracts/catalog/catalogPage.ts";

export type CatalogListAction<T> =
  | { readonly type: "catalog-list/requested"; readonly query: string; readonly offset: number }
  | { readonly type: "catalog-list/loaded"; readonly page: CatalogPage<T> }
  | { readonly type: "catalog-list/failed"; readonly failure: string }
  | { readonly type: "catalog-list/create-started" }
  | { readonly type: "catalog-list/create-failed"; readonly failure: string }
  | { readonly type: "catalog-list/created" };

export const catalogListRequested = (query: string, offset: number): CatalogListAction<never> => ({
  type: "catalog-list/requested",
  query,
  offset,
});
export const catalogListLoaded = <T>(page: CatalogPage<T>): CatalogListAction<T> => ({ type: "catalog-list/loaded", page });
export const catalogListFailed = (failure: string): CatalogListAction<never> => ({ type: "catalog-list/failed", failure });
export const catalogCreateStarted = (): CatalogListAction<never> => ({ type: "catalog-list/create-started" });
export const catalogCreateFailed = (failure: string): CatalogListAction<never> => ({ type: "catalog-list/create-failed", failure });
export const catalogCreated = (): CatalogListAction<never> => ({ type: "catalog-list/created" });
