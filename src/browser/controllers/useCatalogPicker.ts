// Searches one catalog list of the library so the user can choose an entry from the first
// page of results. The search function is a module constant.
import { useCallback, useReducer } from "preact/hooks";
import type { CatalogPage } from "../../contracts/catalog/catalogPage.ts";
import type { ApiResult } from "../server-api/requestJson.ts";
import { pickerFailed, pickerLoaded, pickerRequested } from "../state/catalog/catalogPickerActions.ts";
import { catalogPickerReducer, initialCatalogPickerState, type CatalogPickerState } from "../state/catalog/catalogPickerReducer.ts";
import type { FormValues } from "./formValuesOf.ts";

type FetchPage<T> = (libraryId: string, query: string, offset: number) => Promise<ApiResult<CatalogPage<T>>>;

export type CatalogPickerControls<T> = { readonly state: CatalogPickerState<T>; readonly search: (values: FormValues) => void };

export function useCatalogPicker<T>(libraryId: string, fetchPage: FetchPage<T>): CatalogPickerControls<T> {
  const [state, dispatch] = useReducer(catalogPickerReducer<T>, initialCatalogPickerState);
  const search = useCallback((values: FormValues) => {
    dispatch(pickerRequested());
    void fetchPage(libraryId, (values["query"] ?? "").trim(), 0).then((result) => dispatch(result.ok ? pickerLoaded(result.value.items) : pickerFailed(result.code)));
  }, [libraryId, fetchPage]);
  return { state, search };
}
