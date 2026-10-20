// Query string of the recording list: the catalog search and window, optionally limited to
// recordings that credit one performer or carry one genre.
import Type from "typebox";
import { catalogPageQuerySchema } from "../catalog/catalogPageQuerySchema.ts";

export const recordingPageQuerySchema = Type.Object(
  {
    ...catalogPageQuerySchema.properties,
    performerId: Type.Optional(Type.String({ format: "uuid" })),
    genreId: Type.Optional(Type.String({ format: "uuid" })),
  },
  { additionalProperties: false },
);
