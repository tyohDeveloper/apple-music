import { describe, expect, it } from "vitest";
import { updateAlbumRequestOf } from "../../../src/forms/updateAlbumRequestOf.ts";

describe("updateAlbumRequestOf", () => {
  it("sends every field, with blanks as null", () => {
    expect(updateAlbumRequestOf({ title: "Kind of Blue", kind: "album", released: "1959", label: " Columbia ", notes: "" })).toEqual({
      title: "Kind of Blue",
      kind: "album",
      released: "1959",
      label: "Columbia",
      notes: null,
    });
  });
});
