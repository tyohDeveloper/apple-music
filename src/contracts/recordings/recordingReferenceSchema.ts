// The recording a track plays: enough to recognize it and its performers.
import Type from "typebox";

export const recordingReferenceSchema = Type.Object(
  {
    id: Type.String(),
    title: Type.String(),
    versionNote: Type.Union([Type.String(), Type.Null()]),
    durationMs: Type.Union([Type.Integer(), Type.Null()]),
    creditLine: Type.String(),
  },
  { additionalProperties: false },
);

export type RecordingReference = Type.Static<typeof recordingReferenceSchema>;
