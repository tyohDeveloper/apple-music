// Genre search, paging and creation of top-level genres for one library. A created genre
// opens in the editor.
import type { GenreSummary } from "../../contracts/genres/genreSummarySchema.ts";
import { createGenreRequestOf } from "../../forms/createGenreRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import { fetchGenrePage, postGenre } from "../server-api/genreRequests.ts";
import { useCatalogList, type CatalogListControls, type CatalogListRequests } from "./useCatalogList.ts";

export type GenreListControls = CatalogListControls<GenreSummary>;

const genreListRequests: CatalogListRequests<GenreSummary> = {
  fetchPage: fetchGenrePage,
  create: (libraryId, values) => postGenre(libraryId, createGenreRequestOf(values)),
};

export function useGenreList(libraryId: string, navigate: (route: Route) => void): GenreListControls {
  return useCatalogList(libraryId, genreListRequests, (genreId) => navigate({ name: "genre", libraryId, genreId }));
}
