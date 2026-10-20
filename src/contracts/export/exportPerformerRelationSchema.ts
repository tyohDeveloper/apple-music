// One standing relation between two performers in a library export, by id: the subject is
// related to the object, as in "subject member-of object".
import Type from "typebox";
import { performerRelationKindSchema } from "../performers/performerRelationKindSchema.ts";
import { exportIdSchema } from "./exportIdSchema.ts";
import { exportPartialDateSchema } from "./exportPartialDateSchema.ts";

export const exportPerformerRelationSchema = Type.Object(
  {
    id: exportIdSchema,
    subjectId: exportIdSchema,
    objectId: exportIdSchema,
    kind: performerRelationKindSchema,
    roles: Type.Array(Type.String()),
    began: exportPartialDateSchema,
    ended: exportPartialDateSchema,
    notes: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false },
);

export type ExportPerformerRelation = Type.Static<typeof exportPerformerRelationSchema>;
