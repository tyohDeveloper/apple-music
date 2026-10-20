// The recordings that credit one performer, a page at a time.
import type { RecordingSummary } from "../../contracts/recordings/recordingSummarySchema.ts";
import { fetchLinkedRecordingPage, type RecordingFilter } from "../server-api/recordingRequests.ts";
import { useLinkedList, type LinkedListControls } from "./useLinkedList.ts";

export type LinkedRecordingsControls = LinkedListControls<RecordingSummary>;

export function useLinkedRecordings(libraryId: string, filter: RecordingFilter): LinkedRecordingsControls {
  return useLinkedList(`${libraryId}/${JSON.stringify(filter)}`, (offset) => fetchLinkedRecordingPage(libraryId, filter, offset));
}
