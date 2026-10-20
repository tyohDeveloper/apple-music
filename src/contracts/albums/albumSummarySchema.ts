// An album as listed in search results, with the size of its track list and its editions.
import Type from "typebox";

export const albumSummarySchema = Type.Object(
  {
    id: Type.String(),
    title: Type.String(),
    kind: Type.String(),
    released: Type.Union([Type.String(), Type.Null()]),
    creditLine: Type.String(),
    trackCount: Type.Integer({ minimum: 0 }),
    editionCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false },
);

export type AlbumSummary = Type.Static<typeof albumSummarySchema>;
