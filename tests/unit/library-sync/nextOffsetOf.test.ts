import { describe, expect, it } from "vitest";
import { nextOffsetOf } from "../../../src/library-sync/nextOffsetOf.ts";

describe("nextOffsetOf", () => {
  it("takes the offset of Apple's next subpath", () => {
    expect(nextOffsetOf("/v1/me/library/songs?offset=100", 0)).toBe(100);
    expect(nextOffsetOf("/v1/me/library/songs?limit=100&offset=200", 100)).toBe(200);
  });

  it("is done without a next subpath", () => {
    expect(nextOffsetOf(null, 300)).toBe("done");
  });

  it("takes only the offset of a next naming another host", () => {
    expect(nextOffsetOf("https://elsewhere.example/v1/steal?offset=100", 0)).toBe(100);
  });

  it("refuses a next that would not move forward or has no offset", () => {
    expect(nextOffsetOf("/v1/me/library/songs?offset=100", 100)).toBe("malformed");
    expect(nextOffsetOf("/v1/me/library/songs?offset=50", 100)).toBe("malformed");
    expect(nextOffsetOf("/v1/me/library/songs", 0)).toBe("malformed");
    expect(nextOffsetOf("/v1/me/library/songs?offset=1e3", 0)).toBe("malformed");
    expect(nextOffsetOf("/v1/me/library/songs?offset=-5", 0)).toBe("malformed");
  });
});
