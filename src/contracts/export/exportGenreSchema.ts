// One genre in a library export: its place in the tree by parent id, and its aliases.
import Type from "typebox";
import { exportIdSchema } from "./exportIdSchema.ts";
import { exportInstantSchema } from "./exportInstantSchema.ts";

export const exportGenreSchema = Type.Object(
  {
    id: exportIdSchema,
    parentId: Type.Union([exportIdSchema, Type.Null()]),
    name: Type.String(),
    notes: Type.Union([Type.String(), Type.Null()]),
    aliases: Type.Array(Type.Object({ id: exportIdSchema, name: Type.String() }, { additionalProperties: false })),
    createdAt: exportInstantSchema,
    updatedAt: exportInstantSchema,
  },
  { additionalProperties: false },
);

export type ExportGenre = Type.Static<typeof exportGenreSchema>;
