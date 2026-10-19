// A new performer and the name it is created under, which becomes its preferred name.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { performerKindSchema } from "./performerKindSchema.ts";

export const createPerformerRequestSchema = Type.Object(
  {
    kind: performerKindSchema,
    name: shortTextSchema,
    sortName: Type.Optional(shortTextSchema),
    began: Type.Optional(partialDateSchema),
    ended: Type.Optional(partialDateSchema),
    area: Type.Optional(shortTextSchema),
    disambiguation: Type.Optional(shortTextSchema),
    notes: Type.Optional(noteTextSchema),
  },
  { additionalProperties: false },
);

export type CreatePerformerRequest = Type.Static<typeof createPerformerRequestSchema>;
