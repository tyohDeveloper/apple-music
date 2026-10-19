// A catalog editor screen: the entity as last read or saved, and the progress of a change.
import type { CatalogEditorAction } from "./catalogEditorActions.ts";

export type CatalogEditorState<T> = {
  readonly status: "idle" | "loading" | "loaded" | "failed";
  readonly entity: T | null;
  readonly failure: string | null;
  readonly saving: boolean;
  readonly saveFailure: string | null;
  readonly confirmingDelete: boolean;
};

export const initialCatalogEditorState: CatalogEditorState<never> = {
  status: "idle",
  entity: null,
  failure: null,
  saving: false,
  saveFailure: null,
  confirmingDelete: false,
};

export function catalogEditorReducer<T>(state: CatalogEditorState<T>, action: CatalogEditorAction<T>): CatalogEditorState<T> {
  switch (action.type) {
    case "catalog-editor/requested":
      return { ...initialCatalogEditorState, status: "loading" };
    case "catalog-editor/loaded":
      return { ...state, status: "loaded", entity: action.entity };
    case "catalog-editor/failed":
      return { ...state, status: "failed", failure: action.failure };
    case "catalog-editor/save-started":
      return { ...state, saving: true, saveFailure: null };
    case "catalog-editor/saved":
      return { ...state, saving: false, entity: action.entity };
    case "catalog-editor/save-failed":
      return { ...state, saving: false, saveFailure: action.failure, confirmingDelete: false };
    case "catalog-editor/delete-requested":
      return { ...state, confirmingDelete: true };
    case "catalog-editor/delete-cancelled":
      return { ...state, confirmingDelete: false };
  }
}
