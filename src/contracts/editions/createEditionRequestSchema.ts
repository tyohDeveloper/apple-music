// A new edition of an album. Its tracks are added afterwards with PUT /editions/{id}/tracks.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { editionKindSchema } from "./editionKindSchema.ts";

export const createEditionRequestSchema = Type.Object(
  {
    title: shortTextSchema,
    kind: editionKindSchema,
    released: Type.Optional(partialDateSchema),
    notes: Type.Optional(noteTextSchema),
  },
  { additionalProperties: false },
);

export type CreateEditionRequest = Type.Static<typeof createEditionRequestSchema>;
