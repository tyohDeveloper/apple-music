import Type from "typebox";

export const performerRelationParamsSchema = Type.Object(
  {
    libraryId: Type.String({ format: "uuid" }),
    performerId: Type.String({ format: "uuid" }),
    relationId: Type.String({ format: "uuid" }),
  },
  { additionalProperties: false },
);
