import Type from "typebox";

export const librarySummarySchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    label: Type.String(),
    storefront: Type.Union([Type.String(), Type.Null()]),
    role: Type.String(),
  },
  { additionalProperties: false },
);

export type LibrarySummary = Type.Static<typeof librarySummarySchema>;
