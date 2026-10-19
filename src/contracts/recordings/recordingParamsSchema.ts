import Type from "typebox";

export const recordingParamsSchema = Type.Object(
  { libraryId: Type.String({ format: "uuid" }), recordingId: Type.String({ format: "uuid" }) },
  { additionalProperties: false },
);
