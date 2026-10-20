// Loads one catalog entity and applies changes to it; every change answers with the entity
// as it now stands. Deletion asks for confirmation first. The requests object is a module
// constant, so the entity loads once per id.
import { useEffect, useReducer } from "preact/hooks";
import type { ApiResult } from "../server-api/requestJson.ts";
import * as actions from "../state/catalog/catalogEditorActions.ts";
import { catalogEditorReducer, initialCatalogEditorState, type CatalogEditorState } from "../state/catalog/catalogEditorReducer.ts";

export type CatalogEditorRequests<T> = {
  readonly fetch: (libraryId: string, id: string) => Promise<ApiResult<T>>;
  readonly remove: (libraryId: string, id: string) => Promise<ApiResult<unknown>>;
};

export type CatalogEditorControls<T> = {
  readonly state: CatalogEditorState<T>;
  readonly apply: (request: Promise<ApiResult<T>>, onApplied?: (entity: T) => void) => void;
  readonly refuse: (failure: string) => void;
  readonly requestDelete: () => void;
  readonly cancelDelete: () => void;
  readonly confirmDelete: () => void;
};

type Dispatch<T> = (action: actions.CatalogEditorAction<T>) => void;

function changeControls<T>(dispatch: Dispatch<T>) {
  return {
    apply: (request: Promise<ApiResult<T>>, onApplied?: (entity: T) => void): void => {
      dispatch(actions.catalogSaveStarted());
      void request.then((result) => {
        dispatch(result.ok ? actions.catalogSaved(result.value) : actions.catalogSaveFailed(result.code));
        if (result.ok) onApplied?.(result.value);
      });
    },
    refuse: (failure: string): void => dispatch(actions.catalogSaveFailed(failure)),
    requestDelete: (): void => dispatch(actions.catalogDeleteRequested()),
    cancelDelete: (): void => dispatch(actions.catalogDeleteCancelled()),
  };
}

export function useCatalogEditor<T>(libraryId: string, id: string, requests: CatalogEditorRequests<T>, onDeleted: () => void): CatalogEditorControls<T> {
  const [state, dispatch] = useReducer(catalogEditorReducer<T>, initialCatalogEditorState);
  useEffect(() => {
    dispatch(actions.catalogEntityRequested());
    void requests.fetch(libraryId, id).then((result) => dispatch(result.ok ? actions.catalogEntityLoaded(result.value) : actions.catalogEntityFailed(result.code)));
  }, [libraryId, id, requests]);
  const confirmDelete = (): void => {
    dispatch(actions.catalogSaveStarted());
    void requests.remove(libraryId, id).then((result) => {
      if (result.ok) onDeleted();
      else dispatch(actions.catalogSaveFailed(result.code));
    });
  };
  return { state, ...changeControls(dispatch), confirmDelete };
}
