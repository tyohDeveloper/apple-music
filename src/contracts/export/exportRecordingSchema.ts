// One recording in a library export, with its credits in order, its genres in order by id
// and its external identifiers.
import Type from "typebox";
import { externalIdSchema } from "../identifiers/externalIdSchema.ts";
import { durationMsSchema } from "../recordings/durationMsSchema.ts";
import { recordingKindSchema } from "../recordings/recordingKindSchema.ts";
import { exportCreditSchema } from "./exportCreditSchema.ts";
import { exportIdSchema } from "./exportIdSchema.ts";
import { exportInstantSchema } from "./exportInstantSchema.ts";
import { exportPartialDateSchema } from "./exportPartialDateSchema.ts";

const nullableText = Type.Union([Type.String(), Type.Null()]);

export const exportRecordingSchema = Type.Object(
  {
    id: exportIdSchema,
    title: Type.String(),
    versionNote: nullableText,
    kind: recordingKindSchema,
    recordedFrom: exportPartialDateSchema,
    recordedTo: exportPartialDateSchema,
    venue: nullableText,
    durationMs: Type.Union([durationMsSchema, Type.Null()]),
    notes: nullableText,
    credits: Type.Array(exportCreditSchema),
    genreIds: Type.Array(exportIdSchema),
    externalIds: Type.Array(externalIdSchema),
    createdAt: exportInstantSchema,
    updatedAt: exportInstantSchema,
  },
  { additionalProperties: false },
);

export type ExportRecording = Type.Static<typeof exportRecordingSchema>;
