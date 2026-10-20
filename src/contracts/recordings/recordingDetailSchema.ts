// One recording with its ordered credits, the credit line they make, its genres and its
// external identifiers.
import Type from "typebox";
import { creditSchema } from "../credits/creditSchema.ts";
import { genreReferenceSchema } from "../genres/genreReferenceSchema.ts";
import { externalIdSchema } from "../identifiers/externalIdSchema.ts";

const nullableText = Type.Union([Type.String(), Type.Null()]);

export const recordingDetailSchema = Type.Object(
  {
    id: Type.String(),
    title: Type.String(),
    versionNote: nullableText,
    kind: Type.String(),
    recordedFrom: nullableText,
    recordedTo: nullableText,
    venue: nullableText,
    durationMs: Type.Union([Type.Integer(), Type.Null()]),
    notes: nullableText,
    creditLine: Type.String(),
    credits: Type.Array(creditSchema),
    genres: Type.Array(genreReferenceSchema),
    externalIds: Type.Array(externalIdSchema),
  },
  { additionalProperties: false },
);

export type RecordingDetail = Type.Static<typeof recordingDetailSchema>;
