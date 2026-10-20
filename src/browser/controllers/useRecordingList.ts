// Recording search, paging and creation for one library. A created recording opens in the
// editor.
import type { RecordingSummary } from "../../contracts/recordings/recordingSummarySchema.ts";
import { createRecordingRequestOf } from "../../forms/createRecordingRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import { fetchRecordingPage, postRecording } from "../server-api/recordingRequests.ts";
import { useCatalogList, type CatalogListControls, type CatalogListRequests } from "./useCatalogList.ts";

export type RecordingListControls = CatalogListControls<RecordingSummary>;

const recordingListRequests: CatalogListRequests<RecordingSummary> = {
  fetchPage: fetchRecordingPage,
  create: (libraryId, values) => postRecording(libraryId, createRecordingRequestOf(values)),
};

export function useRecordingList(libraryId: string, navigate: (route: Route) => void): RecordingListControls {
  return useCatalogList(libraryId, recordingListRequests, (recordingId) => navigate({ name: "recording", libraryId, recordingId }));
}
