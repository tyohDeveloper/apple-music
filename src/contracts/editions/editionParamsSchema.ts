import Type from "typebox";

export const editionParamsSchema = Type.Object(
  { libraryId: Type.String({ format: "uuid" }), editionId: Type.String({ format: "uuid" }) },
  { additionalProperties: false },
);
