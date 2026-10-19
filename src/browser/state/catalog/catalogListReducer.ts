// A catalog list screen: the current search, one page of results, and creation.
import type { CatalogListAction } from "./catalogListActions.ts";

export type CatalogListState<T> = {
  readonly status: "idle" | "loading" | "loaded" | "failed";
  readonly query: string;
  readonly offset: number;
  readonly items: readonly T[];
  readonly total: number;
  readonly failure: string | null;
  readonly creating: boolean;
  readonly createFailure: string | null;
};

export type PageRange = { readonly from: number; readonly to: number; readonly total: number; readonly hasPrevious: boolean; readonly hasNext: boolean };

export const initialCatalogListState: CatalogListState<never> = {
  status: "idle",
  query: "",
  offset: 0,
  items: [],
  total: 0,
  failure: null,
  creating: false,
  createFailure: null,
};

export function catalogListReducer<T>(state: CatalogListState<T>, action: CatalogListAction<T>): CatalogListState<T> {
  switch (action.type) {
    case "catalog-list/requested":
      return { ...state, status: "loading", query: action.query, offset: action.offset, failure: null };
    case "catalog-list/loaded":
      return { ...state, status: "loaded", items: action.page.items, total: action.page.total };
    case "catalog-list/failed":
      return { ...state, status: "failed", failure: action.failure };
    case "catalog-list/create-started":
      return { ...state, creating: true, createFailure: null };
    case "catalog-list/create-failed":
      return { ...state, creating: false, createFailure: action.failure };
    case "catalog-list/created":
      return { ...state, creating: false };
  }
}

// The 1-based range of results on screen, for "1–25 of 340" and the paging buttons.
export function pageRangeOf<T>(state: CatalogListState<T>): PageRange {
  const to = state.offset + state.items.length;
  return { from: state.items.length === 0 ? 0 : state.offset + 1, to, total: state.total, hasPrevious: state.offset > 0, hasNext: to < state.total };
}
