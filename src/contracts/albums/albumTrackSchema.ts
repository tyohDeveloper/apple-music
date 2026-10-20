// One slot of an album's intended track list: where it sits, the recording it plays, and the
// title and number printed for it when they differ from the recording's.
import Type from "typebox";
import { recordingReferenceSchema } from "../recordings/recordingReferenceSchema.ts";

export const albumTrackSchema = Type.Object(
  {
    discIndex: Type.Integer({ minimum: 0 }),
    position: Type.Integer({ minimum: 0 }),
    title: Type.Union([Type.String(), Type.Null()]),
    label: Type.Union([Type.String(), Type.Null()]),
    recording: recordingReferenceSchema,
  },
  { additionalProperties: false },
);

export type AlbumTrack = Type.Static<typeof albumTrackSchema>;
