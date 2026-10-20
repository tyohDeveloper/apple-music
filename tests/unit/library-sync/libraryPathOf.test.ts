import { describe, expect, it } from "vitest";
import { libraryPathOf } from "../../../src/library-sync/libraryPathOf.ts";

describe("libraryPathOf", () => {
  it("sets the page size, the relationships and the offset on every page", () => {
    expect(libraryPathOf("song", 0, 100)).toBe("/v1/me/library/songs?limit=100&include=albums,artists,catalog&offset=0");
    expect(libraryPathOf("album", 200, 100)).toBe("/v1/me/library/albums?limit=100&include=artists,catalog&offset=200");
    expect(libraryPathOf("artist", 2, 2)).toBe("/v1/me/library/artists?limit=2&include=catalog&offset=2");
    expect(libraryPathOf("playlist", 0, 100)).toBe("/v1/me/library/playlists?limit=100&include=catalog&offset=0");
  });
});
