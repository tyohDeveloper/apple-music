// A page at a time of the entries linked to one entity, such as the recordings that credit a
// performer or the albums that play a recording. The key names the link; the list reloads
// when it changes.
import { useCallback, useEffect, useReducer } from "preact/hooks";
import type { CatalogPage } from "../../contracts/catalog/catalogPage.ts";
import { catalogPageSize } from "../server-api/catalogPageRequest.ts";
import type { ApiResult } from "../server-api/requestJson.ts";
import { catalogListFailed, catalogListLoaded, catalogListRequested } from "../state/catalog/catalogListActions.ts";
import { catalogListReducer, initialCatalogListState, type CatalogListState } from "../state/catalog/catalogListReducer.ts";

export type LinkedListControls<T> = {
  readonly state: CatalogListState<T>;
  readonly showPrevious: () => void;
  readonly showNext: () => void;
};

export function useLinkedList<T>(key: string, fetchPage: (offset: number) => Promise<ApiResult<CatalogPage<T>>>): LinkedListControls<T> {
  const [state, dispatch] = useReducer(catalogListReducer<T>, initialCatalogListState);
  // fetchPage is a fresh closure on every render; key says what it fetches.
  const load = useCallback((offset: number) => {
    dispatch(catalogListRequested("", offset));
    void fetchPage(offset).then((result) => dispatch(result.ok ? catalogListLoaded(result.value) : catalogListFailed(result.code)));
  }, [key]);
  useEffect(() => load(0), [load]);
  return { state, showPrevious: () => load(Math.max(0, state.offset - catalogPageSize)), showNext: () => load(state.offset + catalogPageSize) };
}
