import { describe, expect, it } from "vitest";
import { createAlbumRequestOf } from "../../../src/forms/createAlbumRequestOf.ts";

describe("createAlbumRequestOf", () => {
  it("sends the title, kind and a release date when given", () => {
    expect(createAlbumRequestOf({ title: "Kind of Blue", kind: "album", released: " 1959-08-17 " })).toEqual({ title: "Kind of Blue", kind: "album", released: "1959-08-17" });
  });
  it("leaves out a blank release date", () => expect(createAlbumRequestOf({ title: "Kind of Blue", kind: "album", released: "" })).toEqual({ title: "Kind of Blue", kind: "album" }));
});
