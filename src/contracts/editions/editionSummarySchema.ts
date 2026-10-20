// An edition as listed on its album.
import Type from "typebox";

export const editionSummarySchema = Type.Object(
  {
    id: Type.String(),
    title: Type.String(),
    kind: Type.String(),
    released: Type.Union([Type.String(), Type.Null()]),
    trackCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false },
);

export type EditionSummary = Type.Static<typeof editionSummarySchema>;
