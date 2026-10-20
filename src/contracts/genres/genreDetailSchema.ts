// One genre with its ancestors from the top down (the last is its parent), its aliases, its
// subgenres, and how many albums, recordings and performers carry it.
import Type from "typebox";
import { genreReferenceSchema } from "./genreReferenceSchema.ts";

const count = Type.Integer({ minimum: 0 });

export const genreDetailSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
    notes: Type.Union([Type.String(), Type.Null()]),
    path: Type.Array(genreReferenceSchema),
    aliases: Type.Array(genreReferenceSchema),
    subgenres: Type.Array(genreReferenceSchema),
    uses: Type.Object({ albums: count, recordings: count, performers: count }, { additionalProperties: false }),
  },
  { additionalProperties: false },
);

export type GenreDetail = Type.Static<typeof genreDetailSchema>;
