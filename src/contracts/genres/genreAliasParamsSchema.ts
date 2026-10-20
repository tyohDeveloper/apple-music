import Type from "typebox";

export const genreAliasParamsSchema = Type.Object(
  { libraryId: Type.String({ format: "uuid" }), genreId: Type.String({ format: "uuid" }), aliasId: Type.String({ format: "uuid" }) },
  { additionalProperties: false },
);
