// Loads one genre and applies edits: its details, its place in the tree, its aliases, and
// new subgenres under it. Every change answers with the genre as it now stands.
import type { GenreDetail } from "../../contracts/genres/genreDetailSchema.ts";
import { createGenreRequestOf } from "../../forms/createGenreRequestOf.ts";
import { moveGenreRequestOf } from "../../forms/moveGenreRequestOf.ts";
import { updateGenreRequestOf } from "../../forms/updateGenreRequestOf.ts";
import type { Route } from "../../routing/parseRoute.ts";
import * as remote from "../server-api/genreRequests.ts";
import { useCatalogEditor, type CatalogEditorControls, type CatalogEditorRequests } from "./useCatalogEditor.ts";
import type { FormValues } from "./formValuesOf.ts";

const genreEditorRequests: CatalogEditorRequests<GenreDetail> = { fetch: remote.fetchGenre, remove: remote.deleteGenre };

export type GenreEditorControls = CatalogEditorControls<GenreDetail> & {
  readonly save: (values: FormValues) => void;
  readonly move: (values: FormValues) => void;
  readonly addAlias: (values: FormValues) => void;
  readonly removeAlias: (aliasId: string) => void;
  readonly addSubgenre: (values: FormValues) => void;
};

export function useGenreEditor(libraryId: string, genreId: string, navigate: (route: Route) => void): GenreEditorControls {
  const editor = useCatalogEditor(libraryId, genreId, genreEditorRequests, () => navigate({ name: "genres", libraryId }));
  const { apply } = editor;
  // A new subgenre answers with itself; the genre on screen is read again to list it.
  const addSubgenre = (values: FormValues): void =>
    apply(remote.postGenre(libraryId, createGenreRequestOf(values, genreId)).then((created) => (created.ok ? remote.fetchGenre(libraryId, genreId) : created)));
  return {
    ...editor,
    save: (values) => apply(remote.patchGenre(libraryId, genreId, updateGenreRequestOf(values))),
    move: (values) => apply(remote.patchGenre(libraryId, genreId, moveGenreRequestOf(values))),
    addAlias: (values) => apply(remote.postGenreAlias(libraryId, genreId, { name: values["name"] ?? "" })),
    removeAlias: (aliasId) => apply(remote.deleteGenreAlias(libraryId, genreId, aliasId)),
    addSubgenre,
  };
}
