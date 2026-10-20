// Query string of the performer list: the catalog search and window, optionally limited to
// performers carrying one genre.
import Type from "typebox";
import { catalogPageQuerySchema } from "../catalog/catalogPageQuerySchema.ts";

export const performerPageQuerySchema = Type.Object(
  { ...catalogPageQuerySchema.properties, genreId: Type.Optional(Type.String({ format: "uuid" })) },
  { additionalProperties: false },
);
