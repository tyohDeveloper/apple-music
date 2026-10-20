import { describe, expect, it } from "vitest";
import { normalizedExternalIdOf } from "../../../src/identifiers/normalizedExternalIdOf.ts";

describe("normalizedExternalIdOf", () => {
  it("removes separators from an ISRC and upper-cases it", () => {
    expect(normalizedExternalIdOf("recording", "isrc", " us-sm1-59-00113 ")).toBe("USSM15900113");
  });

  it("lower-cases a MusicBrainz id and upper-cases a Wikidata item", () => {
    expect(normalizedExternalIdOf("performer", "musicbrainz", "561D854A-6A28-4AA7-8C99-323E6CE46C2A")).toBe("561d854a-6a28-4aa7-8c99-323e6ce46c2a");
    expect(normalizedExternalIdOf("performer", "wikidata", "q93341")).toBe("Q93341");
  });

  it("keeps an edition's barcode digits, with or without spaces", () => {
    expect(normalizedExternalIdOf("edition", "upc", "0 74646 93622 4")).toBe("074646936224");
  });

  it("refuses values without their namespace's form", () => {
    expect(normalizedExternalIdOf("recording", "isrc", "USSM1590011")).toBeNull();
    expect(normalizedExternalIdOf("edition", "discogs", "0123")).toBeNull();
    expect(normalizedExternalIdOf("performer", "apple-catalog", "12a")).toBeNull();
  });

  it("refuses a namespace the entity does not take", () => {
    expect(normalizedExternalIdOf("album", "upc", "074646936224")).toBeNull();
  });
});
