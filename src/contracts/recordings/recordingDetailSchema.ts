// One recording with its ordered credits and the credit line they make.
import Type from "typebox";
import { creditSchema } from "../credits/creditSchema.ts";

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
  },
  { additionalProperties: false },
);

export type RecordingDetail = Type.Static<typeof recordingDetailSchema>;
