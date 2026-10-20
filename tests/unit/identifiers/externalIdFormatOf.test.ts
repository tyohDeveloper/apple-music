import { describe, expect, it } from "vitest";
import namespaces from "../../../data/taxonomies/external-id-namespaces.json" with { type: "json" };
import data from "../../../data/identifiers/external-id-formats.json" with { type: "json" };
import { externalIdFormatOf } from "../../../src/identifiers/externalIdFormatOf.ts";

describe("externalIdFormatOf", () => {
  it("finds the form a namespace takes for one kind of entity", () => {
    expect(externalIdFormatOf("recording", "isrc")).toMatchObject({ normalize: ["remove-separators", "upper-case"] });
    expect(externalIdFormatOf("edition", "musicbrainz")?.link).toBe("https://musicbrainz.org/release/{value}");
  });

  it("finds nothing for a namespace the entity does not take", () => {
    expect(externalIdFormatOf("album", "isrc")).toBeUndefined();
    expect(externalIdFormatOf("performer", "upc")).toBeUndefined();
  });

  it("names only namespaces of the taxonomy, each once per kind of entity", () => {
    const declared = new Set(namespaces.entries.map((entry) => entry.id));
    expect(data.formats.every((format) => declared.has(format.namespace))).toBe(true);
    const pairs = data.formats.map((format) => `${format.owner}/${format.namespace}`);
    expect(new Set(pairs).size).toBe(pairs.length);
  });
});
