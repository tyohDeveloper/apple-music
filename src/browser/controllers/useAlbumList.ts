// Album search, paging and creation for one library. A created album opens in the editor.
import type { AlbumSummary } from "../../contracts/albums/albumSummarySchema.ts";
import { createAlbumRequestOf } from "../../forms/createAlbumRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import { fetchAlbumPage, postAlbum } from "../server-api/albumRequests.ts";
import { useCatalogList, type CatalogListControls, type CatalogListRequests } from "./useCatalogList.ts";

export type AlbumListControls = CatalogListControls<AlbumSummary>;

const albumListRequests: CatalogListRequests<AlbumSummary> = {
  fetchPage: fetchAlbumPage,
  create: (libraryId, values) => postAlbum(libraryId, createAlbumRequestOf(values)),
};

export function useAlbumList(libraryId: string, navigate: (route: Route) => void): AlbumListControls {
  return useCatalogList(libraryId, albumListRequests, (albumId) => navigate({ name: "album", libraryId, albumId }));
}
