import { describe, expect, it } from "vitest";
import { createGenreRequestOf } from "../../../src/forms/createGenreRequestOf.ts";

describe("createGenreRequestOf", () => {
  it("names a top-level genre and leaves blank notes out", () => {
    expect(createGenreRequestOf({ name: "Jazz", notes: "  " })).toEqual({ name: "Jazz" });
  });

  it("places a subgenre under its parent, with notes", () => {
    expect(createGenreRequestOf({ name: "Cool jazz", notes: " West Coast " }, "9b2d4f6a-1c3e-4a5b-8d7f-0e2c4a6b8d00")).toEqual({
      name: "Cool jazz",
      parentId: "9b2d4f6a-1c3e-4a5b-8d7f-0e2c4a6b8d00",
      notes: "West Coast",
    });
  });
});
