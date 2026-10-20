// The albums that credit one performer, or that play one recording, a page at a time.
import type { AlbumSummary } from "../../contracts/albums/albumSummarySchema.ts";
import { fetchLinkedAlbumPage } from "../server-api/albumRequests.ts";
import { useLinkedList, type LinkedListControls } from "./useLinkedList.ts";

export type LinkedAlbumsControls = LinkedListControls<AlbumSummary>;
type AlbumFilter = { readonly performerId: string } | { readonly recordingId: string };

export function useLinkedAlbums(libraryId: string, filter: AlbumFilter): LinkedAlbumsControls {
  const key = "performerId" in filter ? `performer/${filter.performerId}` : `recording/${filter.recordingId}`;
  return useLinkedList(`${libraryId}/${key}`, (offset) => fetchLinkedAlbumPage(libraryId, filter, offset));
}
