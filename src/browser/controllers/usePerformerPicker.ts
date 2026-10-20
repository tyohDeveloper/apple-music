// Searches the library's performers so the user can choose one, as the other side of a
// relation or the performer of a credit.
import type { PerformerSummary } from "../../contracts/performers/performerSummarySchema.ts";
import { fetchPerformerPage } from "../server-api/performerRequests.ts";
import { useCatalogPicker, type CatalogPickerControls } from "./useCatalogPicker.ts";

export type PerformerPickerControls = CatalogPickerControls<PerformerSummary>;

export function usePerformerPicker(libraryId: string): PerformerPickerControls {
  return useCatalogPicker(libraryId, fetchPerformerPage);
}
