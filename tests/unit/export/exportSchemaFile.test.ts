import { readFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import { exportSchemaDocument, exportSchemaFile } from "../../../scripts/export-schema/exportSchemaDocument.ts";

describe("docs/schemas/library-export.schema.json", () => {
  it("is the export contract as generated; run npm run write:export-schema after changing it", () => {
    expect(JSON.parse(readFileSync(exportSchemaFile, "utf8"))).toEqual(exportSchemaDocument());
  });

  it("compiles as JSON Schema 2020-12 in strict mode", () => {
    const ajv = new Ajv2020({ strict: true });
    addFormats.default(ajv);
    expect(() => ajv.compile(exportSchemaDocument())).not.toThrow();
  });
});
