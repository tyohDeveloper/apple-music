import Type from "typebox";

export const createLibraryRequestSchema = Type.Object(
  { label: Type.String({ minLength: 1, maxLength: 200, pattern: "\\S" }) },
  { additionalProperties: false },
);

export type CreateLibraryRequest = Type.Static<typeof createLibraryRequestSchema>;
