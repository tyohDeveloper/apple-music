// One performer in a library export, with all of its names (the preferred one first), its
// genres in order by id and its external identifiers.
import Type from "typebox";
import { localeTagSchema } from "../catalog/localeTagSchema.ts";
import { externalIdSchema } from "../identifiers/externalIdSchema.ts";
import { performerKindSchema } from "../performers/performerKindSchema.ts";
import { performerNameKindSchema } from "../performers/performerNameKindSchema.ts";
import { exportIdSchema } from "./exportIdSchema.ts";
import { exportInstantSchema } from "./exportInstantSchema.ts";
import { exportPartialDateSchema } from "./exportPartialDateSchema.ts";

const nullableText = Type.Union([Type.String(), Type.Null()]);

const nameSchema = Type.Object(
  {
    id: exportIdSchema,
    name: Type.String(),
    sortName: Type.String(),
    kind: performerNameKindSchema,
    locale: Type.Union([localeTagSchema, Type.Null()]),
    validFrom: exportPartialDateSchema,
    validTo: exportPartialDateSchema,
    isPreferred: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const exportPerformerSchema = Type.Object(
  {
    id: exportIdSchema,
    kind: performerKindSchema,
    began: exportPartialDateSchema,
    ended: exportPartialDateSchema,
    area: nullableText,
    disambiguation: nullableText,
    notes: nullableText,
    names: Type.Array(nameSchema),
    genreIds: Type.Array(exportIdSchema),
    externalIds: Type.Array(externalIdSchema),
    createdAt: exportInstantSchema,
    updatedAt: exportInstantSchema,
  },
  { additionalProperties: false },
);

export type ExportPerformer = Type.Static<typeof exportPerformerSchema>;
