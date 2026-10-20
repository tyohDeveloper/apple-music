// The whole ordered genre list of an album, recording or performer; the first is its main
// genre. A genre appears once.
import Type from "typebox";

export const replaceGenresRequestSchema = Type.Object(
  { genreIds: Type.Array(Type.String({ format: "uuid" }), { maxItems: 20, uniqueItems: true }) },
  { additionalProperties: false },
);

export type ReplaceGenresRequest = Type.Static<typeof replaceGenresRequestSchema>;
