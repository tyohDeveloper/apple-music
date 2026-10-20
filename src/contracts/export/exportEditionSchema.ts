// One edition of an album in a library export: its tracks in disc and position order, each
// with its inclusion and the recording it plays (null when not yet identified), and its
// external identifiers.
import Type from "typebox";
import { editionKindSchema } from "../editions/editionKindSchema.ts";
import { trackInclusionSchema } from "../editions/trackInclusionSchema.ts";
import { externalIdSchema } from "../identifiers/externalIdSchema.ts";
import { exportIdSchema } from "./exportIdSchema.ts";
import { exportInstantSchema } from "./exportInstantSchema.ts";
import { exportPartialDateSchema } from "./exportPartialDateSchema.ts";

const trackSchema = Type.Object(
  {
    discIndex: Type.Integer({ minimum: 0 }),
    position: Type.Integer({ minimum: 0 }),
    title: Type.String(),
    recordingId: Type.Union([exportIdSchema, Type.Null()]),
    inclusion: trackInclusionSchema,
  },
  { additionalProperties: false },
);

export const exportEditionSchema = Type.Object(
  {
    id: exportIdSchema,
    title: Type.String(),
    kind: editionKindSchema,
    released: exportPartialDateSchema,
    notes: Type.Union([Type.String(), Type.Null()]),
    tracks: Type.Array(trackSchema),
    externalIds: Type.Array(externalIdSchema),
    createdAt: exportInstantSchema,
    updatedAt: exportInstantSchema,
  },
  { additionalProperties: false },
);
