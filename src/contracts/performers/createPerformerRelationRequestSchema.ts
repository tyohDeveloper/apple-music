// A relation from the performer in the path (the subject) to another performer.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { performerRelationKindSchema } from "./performerRelationKindSchema.ts";

export const createPerformerRelationRequestSchema = Type.Object(
  {
    kind: performerRelationKindSchema,
    objectId: Type.String({ format: "uuid" }),
    roles: Type.Optional(Type.Array(shortTextSchema, { maxItems: 20 })),
    began: Type.Optional(partialDateSchema),
    ended: Type.Optional(partialDateSchema),
    notes: Type.Optional(noteTextSchema),
  },
  { additionalProperties: false },
);

export type CreatePerformerRelationRequest = Type.Static<typeof createPerformerRelationRequestSchema>;
