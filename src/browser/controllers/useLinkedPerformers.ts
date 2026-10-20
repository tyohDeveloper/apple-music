// The performers carrying one genre, a page at a time.
import type { PerformerSummary } from "../../contracts/performers/performerSummarySchema.ts";
import { fetchLinkedPerformerPage } from "../server-api/performerRequests.ts";
import { useLinkedList, type LinkedListControls } from "./useLinkedList.ts";

export type LinkedPerformersControls = LinkedListControls<PerformerSummary>;

export function useLinkedPerformers(libraryId: string, filter: { readonly genreId: string }): LinkedPerformersControls {
  return useLinkedList(`${libraryId}/${JSON.stringify(filter)}`, (offset) => fetchLinkedPerformerPage(libraryId, filter, offset));
}
