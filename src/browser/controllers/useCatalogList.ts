// Search, paging and creation for one catalog list of one library. The requests object is
// a module constant, so the first page loads once per library.
import { useCallback, useEffect, useReducer } from "preact/hooks";
import type { CatalogPage } from "../../contracts/catalog/catalogPage.ts";
import { catalogPageSize } from "../server-api/catalogPageRequest.ts";
import type { ApiResult } from "../server-api/requestJson.ts";
import {
  catalogCreated,
  catalogCreateFailed,
  catalogCreateStarted,
  catalogListFailed,
  catalogListLoaded,
  catalogListRequested,
} from "../state/catalog/catalogListActions.ts";
import { catalogListReducer, initialCatalogListState, type CatalogListState } from "../state/catalog/catalogListReducer.ts";
import type { FormValues } from "./formValuesOf.ts";

export type CatalogListRequests<T> = {
  readonly fetchPage: (libraryId: string, query: string, offset: number) => Promise<ApiResult<CatalogPage<T>>>;
  readonly create: (libraryId: string, values: FormValues) => Promise<ApiResult<{ readonly id: string }>>;
};

export type CatalogListControls<T> = {
  readonly state: CatalogListState<T>;
  readonly search: (values: FormValues) => void;
  readonly showPrevious: () => void;
  readonly showNext: () => void;
  readonly create: (values: FormValues) => void;
};

export function useCatalogList<T>(libraryId: string, requests: CatalogListRequests<T>, onCreated: (id: string) => void): CatalogListControls<T> {
  const [state, dispatch] = useReducer(catalogListReducer<T>, initialCatalogListState);
  const load = useCallback((query: string, offset: number) => {
    dispatch(catalogListRequested(query, offset));
    void requests.fetchPage(libraryId, query, offset).then((result) => dispatch(result.ok ? catalogListLoaded(result.value) : catalogListFailed(result.code)));
  }, [libraryId, requests]);
  useEffect(() => load("", 0), [load]);
  const create = (values: FormValues): void => {
    dispatch(catalogCreateStarted());
    void requests.create(libraryId, values).then((result) => {
      dispatch(result.ok ? catalogCreated() : catalogCreateFailed(result.code));
      if (result.ok) onCreated(result.value.id);
    });
  };
  const showPrevious = (): void => load(state.query, Math.max(0, state.offset - catalogPageSize));
  const showNext = (): void => load(state.query, state.offset + catalogPageSize);
  return { state, search: (values) => load((values["query"] ?? "").trim(), 0), showPrevious, showNext, create };
}
