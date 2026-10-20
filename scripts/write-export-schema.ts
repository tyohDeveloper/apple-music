// Writes docs/schemas/library-export.schema.json from the export contract. Run after changing
// src/contracts/export/; tests/unit/export/exportSchemaFile.test.ts fails while the file is stale.
import { writeFileSync } from "node:fs";
import { exportSchemaDocument, exportSchemaFile } from "./export-schema/exportSchemaDocument.ts";

writeFileSync(exportSchemaFile, `${JSON.stringify(exportSchemaDocument(), null, 2)}\n`);
console.log(`wrote ${exportSchemaFile}`);
