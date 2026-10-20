// One track of an edition: where it sits, its title as issued, how it relates to the
// intended album, and its recording when known.
import Type from "typebox";
import { recordingReferenceSchema } from "../recordings/recordingReferenceSchema.ts";

export const editionTrackSchema = Type.Object(
  {
    discIndex: Type.Integer({ minimum: 0 }),
    position: Type.Integer({ minimum: 0 }),
    title: Type.String(),
    inclusion: Type.String(),
    recording: Type.Union([recordingReferenceSchema, Type.Null()]),
  },
  { additionalProperties: false },
);

export type EditionTrack = Type.Static<typeof editionTrackSchema>;
