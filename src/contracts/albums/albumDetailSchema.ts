// One album with its ordered credits, intended track list and editions.
import Type from "typebox";
import { creditSchema } from "../credits/creditSchema.ts";
import { editionSummarySchema } from "../editions/editionSummarySchema.ts";
import { albumTrackSchema } from "./albumTrackSchema.ts";

const nullableText = Type.Union([Type.String(), Type.Null()]);

export const albumDetailSchema = Type.Object(
  {
    id: Type.String(),
    title: Type.String(),
    kind: Type.String(),
    released: nullableText,
    label: nullableText,
    notes: nullableText,
    creditLine: Type.String(),
    credits: Type.Array(creditSchema),
    tracks: Type.Array(albumTrackSchema),
    editions: Type.Array(editionSummarySchema),
  },
  { additionalProperties: false },
);

export type AlbumDetail = Type.Static<typeof albumDetailSchema>;
