// Changes to an edition's own fields; null clears a field. An albumId moves the edition to
// another album of the library, as when Apple Music split one album into two.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { editionKindSchema } from "./editionKindSchema.ts";

export const updateEditionRequestSchema = Type.Object(
  {
    albumId: Type.Optional(Type.String({ format: "uuid" })),
    title: Type.Optional(shortTextSchema),
    kind: Type.Optional(editionKindSchema),
    released: Type.Optional(Type.Union([partialDateSchema, Type.Null()])),
    notes: Type.Optional(Type.Union([noteTextSchema, Type.Null()])),
  },
  { additionalProperties: false, minProperties: 1 },
);

export type UpdateEditionRequest = Type.Static<typeof updateEditionRequestSchema>;
