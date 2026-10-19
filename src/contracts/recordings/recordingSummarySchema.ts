// A recording as listed in search results: enough to recognize it and its performers.
import Type from "typebox";

const nullableText = Type.Union([Type.String(), Type.Null()]);

export const recordingSummarySchema = Type.Object(
  {
    id: Type.String(),
    title: Type.String(),
    versionNote: nullableText,
    kind: Type.String(),
    recordedFrom: nullableText,
    durationMs: Type.Union([Type.Integer(), Type.Null()]),
    creditLine: Type.String(),
  },
  { additionalProperties: false },
);

export type RecordingSummary = Type.Static<typeof recordingSummarySchema>;
