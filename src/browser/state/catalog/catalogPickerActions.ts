// Actions of a catalog picker: a search whose results the user chooses one from, as the
// other performer of a relation or the recording of a track.
export type CatalogPickerAction<T> =
  | { readonly type: "catalog-picker/requested" }
  | { readonly type: "catalog-picker/loaded"; readonly results: readonly T[] }
  | { readonly type: "catalog-picker/failed"; readonly failure: string };

export const pickerRequested = (): CatalogPickerAction<never> => ({ type: "catalog-picker/requested" });
export const pickerLoaded = <T>(results: readonly T[]): CatalogPickerAction<T> => ({ type: "catalog-picker/loaded", results });
export const pickerFailed = (failure: string): CatalogPickerAction<never> => ({ type: "catalog-picker/failed", failure });
