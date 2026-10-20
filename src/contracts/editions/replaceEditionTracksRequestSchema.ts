// The whole track list of an edition, disc by disc, replacing the stored one (ADR-0009).
// Disc and position follow from the order; a disc has at least one track.
import Type from "typebox";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { trackInclusionSchema } from "./trackInclusionSchema.ts";

const editionTrackRequestSchema = Type.Object(
  {
    title: shortTextSchema,
    recordingId: Type.Optional(Type.Union([Type.String({ format: "uuid" }), Type.Null()])),
    inclusion: trackInclusionSchema,
  },
  { additionalProperties: false },
);

const discSchema = Type.Object({ tracks: Type.Array(editionTrackRequestSchema, { minItems: 1, maxItems: 300 }) }, { additionalProperties: false });

export const replaceEditionTracksRequestSchema = Type.Object({ discs: Type.Array(discSchema, { maxItems: 100 }) }, { additionalProperties: false });

export type ReplaceEditionTracksRequest = Type.Static<typeof replaceEditionTracksRequestSchema>;
