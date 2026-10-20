import { describe, expect, it } from "vitest";
import { namespacesOf } from "../../../src/identifiers/namespacesOf.ts";

describe("namespacesOf", () => {
  it("lists what each kind of entity takes", () => {
    expect(namespacesOf("recording")).toEqual(["apple-library", "apple-catalog", "isrc", "musicbrainz", "wikidata"]);
    expect(namespacesOf("album")).toEqual(["musicbrainz", "discogs", "wikidata"]);
    expect(namespacesOf("edition")).toContain("upc");
  });
});
