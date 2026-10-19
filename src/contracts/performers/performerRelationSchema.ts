// A standing relation, read as "subject <kind> object" from either performer's page.
import Type from "typebox";
import { performerReferenceSchema } from "./performerReferenceSchema.ts";

const nullableText = Type.Union([Type.String(), Type.Null()]);

export const performerRelationSchema = Type.Object(
  {
    id: Type.String(),
    kind: Type.String(),
    subject: performerReferenceSchema,
    object: performerReferenceSchema,
    roles: Type.Array(Type.String()),
    began: nullableText,
    ended: nullableText,
    notes: nullableText,
  },
  { additionalProperties: false },
);

export type PerformerRelation = Type.Static<typeof performerRelationSchema>;
