// Error body for every failed /api request. The browser maps the code to a localized message.
import Type from "typebox";

export const errorResponseSchema = Type.Object(
  { error: Type.Object({ code: Type.String() }, { additionalProperties: false }) },
  { additionalProperties: false },
);

export type ErrorResponse = Type.Static<typeof errorResponseSchema>;
