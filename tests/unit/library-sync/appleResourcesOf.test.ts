import { describe, expect, it } from "vitest";
import { appleResourcesOf } from "../../../src/library-sync/appleResourcesOf.ts";

const song = {
  id: "i.song1",
  type: "library-songs",
  href: "/v1/me/library/songs/i.song1",
  attributes: { name: "Harbor Lights", playParams: { id: "i.song1", kind: "song", isLibrary: true } },
  relationships: {
    albums: { href: "/v1/me/library/songs/i.song1/albums", data: [{ id: "l.album1", type: "library-albums", attributes: { name: "Harbor Lights" } }] },
    catalog: { href: "/v1/me/library/songs/i.song1/catalog", data: [{ id: "2001", type: "songs" }] },
    artists: { href: "/v1/me/library/songs/i.song1/artists" },
  },
};

describe("appleResourcesOf", () => {
  it("keeps attributes as returned and reduces relationships to the ids they name", () => {
    expect(appleResourcesOf({ data: [song], next: "/v1/me/library/songs?offset=100", meta: { total: 101 } })).toEqual({
      resources: [{ id: "i.song1", attributes: song.attributes, relationships: { albums: ["l.album1"], catalog: ["2001"] } }],
      next: "/v1/me/library/songs?offset=100",
    });
  });

  it("answers no next page when next is missing or empty, and empty attributes when there are none", () => {
    expect(appleResourcesOf({ data: [{ id: "r.artist1", type: "library-artists" }] })).toEqual({ resources: [{ id: "r.artist1", attributes: {}, relationships: {} }], next: null });
    expect(appleResourcesOf({ data: [], next: "" })).toEqual({ resources: [], next: null });
  });

  it("keeps the last resource of a repeated id", () => {
    const page = appleResourcesOf({ data: [song, { ...song, attributes: { name: "Harbor Lights (Remastered)" } }] });
    expect(page?.resources).toEqual([{ id: "i.song1", attributes: { name: "Harbor Lights (Remastered)" }, relationships: { albums: ["l.album1"], catalog: ["2001"] } }]);
  });

  it("refuses answers without Apple's shape", () => {
    expect(appleResourcesOf(null)).toBeNull();
    expect(appleResourcesOf({ errors: [{ status: "500" }] })).toBeNull();
    expect(appleResourcesOf({ data: [{ type: "library-songs" }] })).toBeNull();
    expect(appleResourcesOf({ data: [{ id: "" }] })).toBeNull();
    expect(appleResourcesOf({ data: ["i.song1"] })).toBeNull();
  });
});
