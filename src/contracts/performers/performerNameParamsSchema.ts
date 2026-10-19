import Type from "typebox";

export const performerNameParamsSchema = Type.Object(
  {
    libraryId: Type.String({ format: "uuid" }),
    performerId: Type.String({ format: "uuid" }),
    nameId: Type.String({ format: "uuid" }),
  },
  { additionalProperties: false },
);
