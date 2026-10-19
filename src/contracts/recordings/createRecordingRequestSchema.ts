// A new recording. Credits are added afterwards with PUT /recordings/{id}/credits.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { durationMsSchema } from "./durationMsSchema.ts";
import { recordingKindSchema } from "./recordingKindSchema.ts";

export const createRecordingRequestSchema = Type.Object(
  {
    title: shortTextSchema,
    versionNote: Type.Optional(shortTextSchema),
    kind: recordingKindSchema,
    recordedFrom: Type.Optional(partialDateSchema),
    recordedTo: Type.Optional(partialDateSchema),
    venue: Type.Optional(shortTextSchema),
    durationMs: Type.Optional(durationMsSchema),
    notes: Type.Optional(noteTextSchema),
  },
  { additionalProperties: false },
);

export type CreateRecordingRequest = Type.Static<typeof createRecordingRequestSchema>;
