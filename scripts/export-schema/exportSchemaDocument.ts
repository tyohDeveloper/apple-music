// The published JSON Schema of library exports: the export contract
// (src/contracts/export/libraryExportSchema.ts) with the header a standalone JSON Schema
// 2020-12 file needs, so that a backup can be checked without running the application.
import { libraryExportSchema } from "../../src/contracts/export/libraryExportSchema.ts";

export const exportSchemaFile = "docs/schemas/library-export.schema.json";

const header = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://raw.githubusercontent.com/tyohDeveloper/apple-music/main/docs/schemas/library-export.schema.json",
  title: "Apple Music Library Manager library export",
  description:
    "The whole curated catalog of one library as one snapshot (docs/design/catalog.md, Export). Generated from the export contract by npm run write:export-schema; do not edit by hand.",
};

export function exportSchemaDocument(): Record<string, unknown> {
  return { ...header, ...(JSON.parse(JSON.stringify(libraryExportSchema)) as Record<string, unknown>) };
}
