import Type from "typebox";

export const performerParamsSchema = Type.Object(
  { libraryId: Type.String({ format: "uuid" }), performerId: Type.String({ format: "uuid" }) },
  { additionalProperties: false },
);
