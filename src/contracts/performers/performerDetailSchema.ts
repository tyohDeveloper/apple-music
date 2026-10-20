// One performer with all of its names, its relations in both directions, its genres and
// its external identifiers.
import Type from "typebox";
import { genreReferenceSchema } from "../genres/genreReferenceSchema.ts";
import { externalIdSchema } from "../identifiers/externalIdSchema.ts";
import { performerNameSchema } from "./performerNameSchema.ts";
import { performerRelationSchema } from "./performerRelationSchema.ts";

const nullableText = Type.Union([Type.String(), Type.Null()]);

export const performerDetailSchema = Type.Object(
  {
    id: Type.String(),
    kind: Type.String(),
    began: nullableText,
    ended: nullableText,
    area: nullableText,
    disambiguation: nullableText,
    notes: nullableText,
    names: Type.Array(performerNameSchema),
    relations: Type.Array(performerRelationSchema),
    genres: Type.Array(genreReferenceSchema),
    externalIds: Type.Array(externalIdSchema),
  },
  { additionalProperties: false },
);

export type PerformerDetail = Type.Static<typeof performerDetailSchema>;
