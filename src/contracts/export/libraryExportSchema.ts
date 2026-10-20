// A library export (docs/design/catalog.md, Export): the whole curated catalog of one
// library as one snapshot. formatVersion is raised only when a reader of the previous format
// could misread a new document; fields that old readers can ignore are added without it.
import Type from "typebox";
import { exportAlbumSchema } from "./exportAlbumSchema.ts";
import { exportGenreSchema } from "./exportGenreSchema.ts";
import { exportIdSchema } from "./exportIdSchema.ts";
import { exportInstantSchema } from "./exportInstantSchema.ts";
import { exportPerformerRelationSchema } from "./exportPerformerRelationSchema.ts";
import { exportPerformerSchema } from "./exportPerformerSchema.ts";
import { exportRecordingSchema } from "./exportRecordingSchema.ts";

const librarySchema = Type.Object(
  {
    id: exportIdSchema,
    label: Type.String(),
    storefront: Type.Union([Type.String(), Type.Null()]),
    createdAt: exportInstantSchema,
    updatedAt: exportInstantSchema,
  },
  { additionalProperties: false },
);

export const libraryExportSchema = Type.Object(
  {
    format: Type.Literal("apple-music-library-export"),
    formatVersion: Type.Literal(1),
    exportedAt: exportInstantSchema,
    application: Type.Object({ name: Type.String(), version: Type.String() }, { additionalProperties: false }),
    library: librarySchema,
    genres: Type.Array(exportGenreSchema),
    performers: Type.Array(exportPerformerSchema),
    performerRelations: Type.Array(exportPerformerRelationSchema),
    recordings: Type.Array(exportRecordingSchema),
    albums: Type.Array(exportAlbumSchema),
  },
  { additionalProperties: false },
);

export type LibraryExport = Type.Static<typeof libraryExportSchema>;
