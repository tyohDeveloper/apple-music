// A new genre: its name, optionally the genre it sits under, and notes.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";

export const createGenreRequestSchema = Type.Object(
  { name: shortTextSchema, parentId: Type.Optional(Type.String({ format: "uuid" })), notes: Type.Optional(noteTextSchema) },
  { additionalProperties: false },
);

export type CreateGenreRequest = Type.Static<typeof createGenreRequestSchema>;
