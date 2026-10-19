// Changes to a performer's own fields; null clears a field. Names and relations have their
// own routes.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { performerKindSchema } from "./performerKindSchema.ts";

export const updatePerformerRequestSchema = Type.Object(
  {
    kind: Type.Optional(performerKindSchema),
    began: Type.Optional(Type.Union([partialDateSchema, Type.Null()])),
    ended: Type.Optional(Type.Union([partialDateSchema, Type.Null()])),
    area: Type.Optional(Type.Union([shortTextSchema, Type.Null()])),
    disambiguation: Type.Optional(Type.Union([shortTextSchema, Type.Null()])),
    notes: Type.Optional(Type.Union([noteTextSchema, Type.Null()])),
  },
  { additionalProperties: false, minProperties: 1 },
);

export type UpdatePerformerRequest = Type.Static<typeof updatePerformerRequestSchema>;
