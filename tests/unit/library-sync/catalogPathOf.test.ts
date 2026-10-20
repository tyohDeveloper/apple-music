import { describe, expect, it } from "vitest";
import { catalogPathOf } from "../../../src/library-sync/catalogPathOf.ts";

describe("catalogPathOf", () => {
  it("names the storefront and kind, with ids separated by commas", () => {
    expect(catalogPathOf("us", "song", ["2001", "2002"])).toBe("/v1/catalog/us/songs?ids=2001,2002");
    expect(catalogPathOf("gb", "album", ["1001"])).toBe("/v1/catalog/gb/albums?ids=1001");
  });

  it("escapes what Apple would not expect in a path or query", () => {
    expect(catalogPathOf("u/s", "song", ["1&2"])).toBe("/v1/catalog/u%2Fs/songs?ids=1%262");
  });
});
