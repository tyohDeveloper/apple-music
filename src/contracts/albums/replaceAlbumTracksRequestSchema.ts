// The whole intended track list of an album, disc by disc, replacing the stored one
// (ADR-0009). Disc and position follow from the order; a disc has at least one track.
import Type from "typebox";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";

const albumTrackRequestSchema = Type.Object(
  {
    recordingId: Type.String({ format: "uuid" }),
    title: Type.Optional(Type.Union([shortTextSchema, Type.Null()])),
    label: Type.Optional(Type.Union([Type.String({ minLength: 1, maxLength: 20 }), Type.Null()])),
  },
  { additionalProperties: false },
);

const discSchema = Type.Object({ tracks: Type.Array(albumTrackRequestSchema, { minItems: 1, maxItems: 300 }) }, { additionalProperties: false });

export const replaceAlbumTracksRequestSchema = Type.Object({ discs: Type.Array(discSchema, { maxItems: 100 }) }, { additionalProperties: false });

export type ReplaceAlbumTracksRequest = Type.Static<typeof replaceAlbumTracksRequestSchema>;
