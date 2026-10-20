// Changes to a genre; a parentId moves it under another genre and null makes it top-level.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";

export const updateGenreRequestSchema = Type.Object(
  {
    name: Type.Optional(shortTextSchema),
    parentId: Type.Optional(Type.Union([Type.String({ format: "uuid" }), Type.Null()])),
    notes: Type.Optional(Type.Union([noteTextSchema, Type.Null()])),
  },
  { additionalProperties: false, minProperties: 1 },
);

export type UpdateGenreRequest = Type.Static<typeof updateGenreRequestSchema>;
