// Path parameters of every route under /api/libraries/{libraryId}.
import Type from "typebox";

export const libraryParamsSchema = Type.Object({ libraryId: Type.String({ format: "uuid" }) }, { additionalProperties: false });
