// Changes to an album's own fields; null clears a field. Credits and tracks have own routes.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { albumKindSchema } from "./albumKindSchema.ts";

export const updateAlbumRequestSchema = Type.Object(
  {
    title: Type.Optional(shortTextSchema),
    kind: Type.Optional(albumKindSchema),
    released: Type.Optional(Type.Union([partialDateSchema, Type.Null()])),
    label: Type.Optional(Type.Union([shortTextSchema, Type.Null()])),
    notes: Type.Optional(Type.Union([noteTextSchema, Type.Null()])),
  },
  { additionalProperties: false, minProperties: 1 },
);

export type UpdateAlbumRequest = Type.Static<typeof updateAlbumRequestSchema>;
