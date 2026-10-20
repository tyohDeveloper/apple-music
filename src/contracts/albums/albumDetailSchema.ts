// One album with its ordered credits, intended track list, editions and genres.
import Type from "typebox";
import { creditSchema } from "../credits/creditSchema.ts";
import { editionSummarySchema } from "../editions/editionSummarySchema.ts";
import { genreReferenceSchema } from "../genres/genreReferenceSchema.ts";
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
    genres: Type.Array(genreReferenceSchema),
  },
  { additionalProperties: false },
);

export type AlbumDetail = Type.Static<typeof albumDetailSchema>;
