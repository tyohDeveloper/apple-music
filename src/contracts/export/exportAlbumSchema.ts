// One album in a library export: its credits, its intended track list in disc and position
// order by recording id, its genres in order by id, its external identifiers and its
// editions.
import Type from "typebox";
import { albumKindSchema } from "../albums/albumKindSchema.ts";
import { externalIdSchema } from "../identifiers/externalIdSchema.ts";
import { exportCreditSchema } from "./exportCreditSchema.ts";
import { exportEditionSchema } from "./exportEditionSchema.ts";
import { exportIdSchema } from "./exportIdSchema.ts";
import { exportInstantSchema } from "./exportInstantSchema.ts";
import { exportPartialDateSchema } from "./exportPartialDateSchema.ts";

const nullableText = Type.Union([Type.String(), Type.Null()]);

const trackSchema = Type.Object(
  {
    discIndex: Type.Integer({ minimum: 0 }),
    position: Type.Integer({ minimum: 0 }),
    recordingId: exportIdSchema,
    title: nullableText,
    label: nullableText,
  },
  { additionalProperties: false },
);

export const exportAlbumSchema = Type.Object(
  {
    id: exportIdSchema,
    title: Type.String(),
    kind: albumKindSchema,
    released: exportPartialDateSchema,
    label: nullableText,
    notes: nullableText,
    credits: Type.Array(exportCreditSchema),
    tracks: Type.Array(trackSchema),
    genreIds: Type.Array(exportIdSchema),
    externalIds: Type.Array(externalIdSchema),
    editions: Type.Array(exportEditionSchema),
    createdAt: exportInstantSchema,
    updatedAt: exportInstantSchema,
  },
  { additionalProperties: false },
);

export type ExportAlbum = Type.Static<typeof exportAlbumSchema>;
