// A new album. Credits, the intended track list and editions are added afterwards.
import Type from "typebox";
import { noteTextSchema } from "../catalog/noteTextSchema.ts";
import { partialDateSchema } from "../catalog/partialDateSchema.ts";
import { shortTextSchema } from "../catalog/shortTextSchema.ts";
import { albumKindSchema } from "./albumKindSchema.ts";

export const createAlbumRequestSchema = Type.Object(
  {
    title: shortTextSchema,
    kind: albumKindSchema,
    released: Type.Optional(partialDateSchema),
    label: Type.Optional(shortTextSchema),
    notes: Type.Optional(noteTextSchema),
  },
  { additionalProperties: false },
);

export type CreateAlbumRequest = Type.Static<typeof createAlbumRequestSchema>;
