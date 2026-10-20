// Edits of the genre list of an album, recording or performer, each saved at once as the
// whole list (PUT .../genres). The form a genre is added from names it genreId.
import { genreIdsAfter, type GenreListChange } from "../state/genres/genreIdsAfter.ts";
import type { FormValues } from "./formValuesOf.ts";

export type GenreAssignmentControls = {
  readonly change: (change: GenreListChange) => void;
  readonly add: (values: FormValues) => void;
};

export function genreAssignmentOf(genres: readonly { readonly id: string }[] | undefined, setGenres: (genreIds: string[]) => void): GenreAssignmentControls {
  const ids = (genres ?? []).map((genre) => genre.id);
  return {
    change: (change) => setGenres(genreIdsAfter(ids, change)),
    add: (values) => {
      const genreId = values["genreId"] ?? "";
      if (genreId !== "") setGenres(genreIdsAfter(ids, { kind: "added", genreId }));
    },
  };
}
