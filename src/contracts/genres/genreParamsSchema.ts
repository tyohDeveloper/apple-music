import Type from "typebox";

export const genreParamsSchema = Type.Object(
  { libraryId: Type.String({ format: "uuid" }), genreId: Type.String({ format: "uuid" }) },
  { additionalProperties: false },
);
