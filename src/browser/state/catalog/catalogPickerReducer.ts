// A catalog picker: the results of the last search.
import type { CatalogPickerAction } from "./catalogPickerActions.ts";

export type CatalogPickerState<T> = {
  readonly status: "idle" | "loading" | "loaded" | "failed";
  readonly results: readonly T[];
  readonly failure: string | null;
};

export const initialCatalogPickerState: CatalogPickerState<never> = { status: "idle", results: [], failure: null };

export function catalogPickerReducer<T>(state: CatalogPickerState<T>, action: CatalogPickerAction<T>): CatalogPickerState<T> {
  switch (action.type) {
    case "catalog-picker/requested":
      return { ...state, status: "loading", failure: null };
    case "catalog-picker/loaded":
      return { status: "loaded", results: action.results, failure: null };
    case "catalog-picker/failed":
      return { ...state, status: "failed", failure: action.failure };
  }
}
