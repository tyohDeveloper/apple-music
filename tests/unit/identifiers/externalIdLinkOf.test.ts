import { describe, expect, it } from "vitest";
import { externalIdLinkOf } from "../../../src/identifiers/externalIdLinkOf.ts";

describe("externalIdLinkOf", () => {
  it("links to the namespace's page for the value", () => {
    expect(externalIdLinkOf("album", "discogs", "5460")).toBe("https://www.discogs.com/master/5460");
    expect(externalIdLinkOf("recording", "wikidata", "Q1")).toBe("https://www.wikidata.org/wiki/Q1");
  });

  it("has no link for namespaces without a page", () => {
    expect(externalIdLinkOf("recording", "isrc", "USSM15900113")).toBeNull();
    expect(externalIdLinkOf("album", "isrc", "USSM15900113")).toBeNull();
  });
});
