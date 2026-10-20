import Type from "typebox";

export const albumParamsSchema = Type.Object(
  { libraryId: Type.String({ format: "uuid" }), albumId: Type.String({ format: "uuid" }) },
  { additionalProperties: false },
);
