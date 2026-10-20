// The recordings that credit one performer, a page at a time, for the performer's page.
import type { RecordingSummary } from "../../contracts/recordings/recordingSummarySchema.ts";
import { fetchCreditedRecordingPage } from "../server-api/recordingRequests.ts";
import { useLinkedList, type LinkedListControls } from "./useLinkedList.ts";

export type CreditedRecordingsControls = LinkedListControls<RecordingSummary>;

export function useCreditedRecordings(libraryId: string, performerId: string): CreditedRecordingsControls {
  return useLinkedList(`${libraryId}/${performerId}`, (offset) => fetchCreditedRecordingPage(libraryId, performerId, offset));
}
