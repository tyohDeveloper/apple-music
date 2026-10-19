// Changes to a recording's own fields; null clears a field. Credits have their own route.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { durationMsSchema } from "./durationMsSchema.ts";
import { recordingKindSchema } from "./recordingKindSchema.ts";

export const updateRecordingRequestSchema = Type.Object(
  {
    title: Type.Optional(shortTextSchema),
    versionNote: Type.Optional(Type.Union([shortTextSchema, Type.Null()])),
    kind: Type.Optional(recordingKindSchema),
    recordedFrom: Type.Optional(Type.Union([partialDateSchema, Type.Null()])),
    recordedTo: Type.Optional(Type.Union([partialDateSchema, Type.Null()])),
    venue: Type.Optional(Type.Union([shortTextSchema, Type.Null()])),
    durationMs: Type.Optional(Type.Union([durationMsSchema, Type.Null()])),
    notes: Type.Optional(Type.Union([noteTextSchema, Type.Null()])),
  },
  { additionalProperties: false, minProperties: 1 },
);

export type UpdateRecordingRequest = Type.Static<typeof updateRecordingRequestSchema>;
