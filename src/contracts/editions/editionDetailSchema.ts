// One edition with its album, its track list and its external identifiers.
import Type from "typebox";
import { externalIdSchema } from "../identifiers/externalIdSchema.ts";
import { editionTrackSchema } from "./editionTrackSchema.ts";

const nullableText = Type.Union([Type.String(), Type.Null()]);

export const editionDetailSchema = Type.Object(
  {
    id: Type.String(),
    album: Type.Object({ id: Type.String(), title: Type.String() }, { additionalProperties: false }),
    title: Type.String(),
    kind: Type.String(),
    released: nullableText,
    notes: nullableText,
    tracks: Type.Array(editionTrackSchema),
    externalIds: Type.Array(externalIdSchema),
  },
  { additionalProperties: false },
);

export type EditionDetail = Type.Static<typeof editionDetailSchema>;
