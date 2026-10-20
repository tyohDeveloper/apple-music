// Path parameters of routes under /api/libraries/{libraryId}/apple-music/sync-runs/{runId}.
import Type from "typebox";

export const syncRunParamsSchema = Type.Object(
  { libraryId: Type.String({ format: "uuid" }), runId: Type.String({ format: "uuid" }) },
  { additionalProperties: false },
);
