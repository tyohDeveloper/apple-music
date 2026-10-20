// Requests for genres and their aliases (docs/design/catalog.md, Genres).
import type { CatalogPage } from "../../contracts/catalog/catalogPage.ts";
import type { CreateGenreAliasRequest } from "../../contracts/genres/createGenreAliasRequestSchema.ts";
import type { CreateGenreRequest } from "../../contracts/genres/createGenreRequestSchema.ts";
import type { GenreDetail } from "../../contracts/genres/genreDetailSchema.ts";
import type { GenreSummary } from "../../contracts/genres/genreSummarySchema.ts";
import type { UpdateGenreRequest } from "../../contracts/genres/updateGenreRequestSchema.ts";
import { fetchCatalogPage } from "./catalogPageRequest.ts";
import { requestJson, type ApiResult } from "./requestJson.ts";

const genres = (libraryId: string): string => `/api/libraries/${libraryId}/genres`;
const genre = (libraryId: string, genreId: string): string => `${genres(libraryId)}/${genreId}`;

export function fetchGenrePage(libraryId: string, query: string, offset: number): Promise<ApiResult<CatalogPage<GenreSummary>>> {
  return fetchCatalogPage<GenreSummary>(genres(libraryId), query, offset);
}

export function postGenre(libraryId: string, body: CreateGenreRequest): Promise<ApiResult<GenreDetail>> {
  return requestJson<GenreDetail>(genres(libraryId), { method: "POST", body });
}

export function fetchGenre(libraryId: string, genreId: string): Promise<ApiResult<GenreDetail>> {
  return requestJson<GenreDetail>(genre(libraryId, genreId));
}

export function patchGenre(libraryId: string, genreId: string, body: UpdateGenreRequest): Promise<ApiResult<GenreDetail>> {
  return requestJson<GenreDetail>(genre(libraryId, genreId), { method: "PATCH", body });
}

export function deleteGenre(libraryId: string, genreId: string): Promise<ApiResult<unknown>> {
  return requestJson(genre(libraryId, genreId), { method: "DELETE" });
}

export function postGenreAlias(libraryId: string, genreId: string, body: CreateGenreAliasRequest): Promise<ApiResult<GenreDetail>> {
  return requestJson<GenreDetail>(`${genre(libraryId, genreId)}/aliases`, { method: "POST", body });
}

export function deleteGenreAlias(libraryId: string, genreId: string, aliasId: string): Promise<ApiResult<GenreDetail>> {
  return requestJson<GenreDetail>(`${genre(libraryId, genreId)}/aliases/${aliasId}`, { method: "DELETE" });
}
