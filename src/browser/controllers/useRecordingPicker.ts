// Searches the library's recordings so the user can choose one, as the recording of a track.
import type { RecordingSummary } from "../../contracts/recordings/recordingSummarySchema.ts";
import { fetchRecordingPage } from "../server-api/recordingRequests.ts";
import { useCatalogPicker, type CatalogPickerControls } from "./useCatalogPicker.ts";

export type RecordingPickerControls = CatalogPickerControls<RecordingSummary>;

export function useRecordingPicker(libraryId: string): RecordingPickerControls {
  return useCatalogPicker(libraryId, fetchRecordingPage);
}
