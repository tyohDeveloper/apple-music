// Requests for albums, their credits and intended track lists (docs/design/catalog.md, slice C).
import type { AlbumDetail } from "../../contracts/albums/albumDetailSchema.ts";
import type { AlbumSummary } from "../../contracts/albums/albumSummarySchema.ts";
import type { CreateAlbumRequest } from "../../contracts/albums/createAlbumRequestSchema.ts";
import type { ReplaceAlbumTracksRequest } from "../../contracts/albums/replaceAlbumTracksRequestSchema.ts";
import type { UpdateAlbumRequest } from "../../contracts/albums/updateAlbumRequestSchema.ts";
import type { CatalogPage } from "../../contracts/catalog/catalogPage.ts";
import type { ReplaceCreditsRequest } from "../../contracts/credits/replaceCreditsRequestSchema.ts";
import { fetchCatalogPage } from "./catalogPageRequest.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

type AlbumFilter = { readonly performerId: string } | { readonly recordingId: string };

const albums = (libraryId: string): string => `/api/libraries/${libraryId}/albums`;
const album = (libraryId: string, albumId: string): string => `${albums(libraryId)}/${albumId}`;

export function fetchAlbumPage(libraryId: string, query: string, offset: number): Promise<ApiResult<CatalogPage<AlbumSummary>>> {
  return fetchCatalogPage<AlbumSummary>(albums(libraryId), query, offset);
}

export function fetchLinkedAlbumPage(libraryId: string, filter: AlbumFilter, offset: number): Promise<ApiResult<CatalogPage<AlbumSummary>>> {
  return fetchCatalogPage<AlbumSummary>(albums(libraryId), "", offset, filter);
}

export function postAlbum(libraryId: string, body: CreateAlbumRequest): Promise<ApiResult<AlbumDetail>> {
  return requestJson<AlbumDetail>(albums(libraryId), { method: "POST", body });
}

export function fetchAlbum(libraryId: string, albumId: string): Promise<ApiResult<AlbumDetail>> {
  return requestJson<AlbumDetail>(album(libraryId, albumId));
}

export function patchAlbum(libraryId: string, albumId: string, body: UpdateAlbumRequest): Promise<ApiResult<AlbumDetail>> {
  return requestJson<AlbumDetail>(album(libraryId, albumId), { method: "PATCH", body });
}

export function deleteAlbum(libraryId: string, albumId: string): Promise<ApiResult<unknown>> {
  return requestJson(album(libraryId, albumId), { method: "DELETE" });
}

export function putAlbumCredits(libraryId: string, albumId: string, body: ReplaceCreditsRequest): Promise<ApiResult<AlbumDetail>> {
  return requestJson<AlbumDetail>(`${album(libraryId, albumId)}/credits`, { method: "PUT", body });
}

export function putAlbumTracks(libraryId: string, albumId: string, body: ReplaceAlbumTracksRequest): Promise<ApiResult<AlbumDetail>> {
  return requestJson<AlbumDetail>(`${album(libraryId, albumId)}/tracks`, { method: "PUT", body });
}
