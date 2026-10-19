// Actions of a catalog editor screen (a performer, recording or album): loading the entity,
// saving changes to it, and confirming its deletion. Every change answers with the entity.
export type CatalogEditorAction<T> =
  | { readonly type: "catalog-editor/requested" }
  | { readonly type: "catalog-editor/loaded"; readonly entity: T }
  | { readonly type: "catalog-editor/failed"; readonly failure: string }
  | { readonly type: "catalog-editor/save-started" }
  | { readonly type: "catalog-editor/saved"; readonly entity: T }
  | { readonly type: "catalog-editor/save-failed"; readonly failure: string }
  | { readonly type: "catalog-editor/delete-requested" }
  | { readonly type: "catalog-editor/delete-cancelled" };

export const catalogEntityRequested = (): CatalogEditorAction<never> => ({ type: "catalog-editor/requested" });
export const catalogEntityLoaded = <T>(entity: T): CatalogEditorAction<T> => ({ type: "catalog-editor/loaded", entity });
export const catalogEntityFailed = (failure: string): CatalogEditorAction<never> => ({ type: "catalog-editor/failed", failure });
export const catalogSaveStarted = (): CatalogEditorAction<never> => ({ type: "catalog-editor/save-started" });
export const catalogSaved = <T>(entity: T): CatalogEditorAction<T> => ({ type: "catalog-editor/saved", entity });
export const catalogSaveFailed = (failure: string): CatalogEditorAction<never> => ({ type: "catalog-editor/save-failed", failure });
export const catalogDeleteRequested = (): CatalogEditorAction<never> => ({ type: "catalog-editor/delete-requested" });
export const catalogDeleteCancelled = (): CatalogEditorAction<never> => ({ type: "catalog-editor/delete-cancelled" });
