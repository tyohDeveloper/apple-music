// One genre in the genre list: its name, the names of its ancestors from the top down, and
// how many subgenres and uses it has.
import Type from "typebox";

export const genreSummarySchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
    path: Type.Array(Type.String()),
    subgenreCount: Type.Integer({ minimum: 0 }),
    useCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false },
);

export type GenreSummary = Type.Static<typeof genreSummarySchema>;
