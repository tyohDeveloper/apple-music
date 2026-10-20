// Query string of the album list: the catalog search and window, optionally limited to the
// albums crediting one performer (on the album or a track) or playing one recording.
import Type from "typebox";
import { catalogPageQuerySchema } from "../catalog/catalogPageQuerySchema.ts";

export const albumPageQuerySchema = Type.Object(
  {
    ...catalogPageQuerySchema.properties,
    performerId: Type.Optional(Type.String({ format: "uuid" })),
    recordingId: Type.Optional(Type.String({ format: "uuid" })),
  },
  { additionalProperties: false },
);
