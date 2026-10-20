// Searches the library's genres so the user can choose one: to give an album, recording or
// performer, or to place a genre under.
import type { GenreSummary } from "../../contracts/genres/genreSummarySchema.ts";
import { fetchGenrePage } from "../server-api/genreRequests.ts";
import { useCatalogPicker, type CatalogPickerControls } from "./useCatalogPicker.ts";

export type GenrePickerControls = CatalogPickerControls<GenreSummary>;

export function useGenrePicker(libraryId: string): GenrePickerControls {
  return useCatalogPicker(libraryId, fetchGenrePage);
}
