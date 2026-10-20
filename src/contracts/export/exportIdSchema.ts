// The id of an entity or owned row in a library export; references between entries use it.
import Type from "typebox";

export const exportIdSchema = Type.String({ format: "uuid" });
