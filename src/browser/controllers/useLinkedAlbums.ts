// The albums that credit one performer, play one recording or carry one genre, a page at a
// time.
import type { AlbumSummary } from "../../contracts/albums/albumSummarySchema.ts";
import { fetchLinkedAlbumPage, type AlbumFilter } from "../server-api/albumRequests.ts";
import { useLinkedList, type LinkedListControls } from "./useLinkedList.ts";

export type LinkedAlbumsControls = LinkedListControls<AlbumSummary>;

export function useLinkedAlbums(libraryId: string, filter: AlbumFilter): LinkedAlbumsControls {
  return useLinkedList(`${libraryId}/${JSON.stringify(filter)}`, (offset) => fetchLinkedAlbumPage(libraryId, filter, offset));
}
