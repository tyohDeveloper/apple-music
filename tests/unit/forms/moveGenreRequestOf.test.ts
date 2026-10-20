import { describe, expect, it } from "vitest";
import { moveGenreRequestOf } from "../../../src/forms/moveGenreRequestOf.ts";

describe("moveGenreRequestOf", () => {
  it("moves under the chosen genre", () => {
    expect(moveGenreRequestOf({ parentId: "9b2d4f6a-1c3e-4a5b-8d7f-0e2c4a6b8d00" })).toEqual({ parentId: "9b2d4f6a-1c3e-4a5b-8d7f-0e2c4a6b8d00" });
  });

  it("moves to the top level when no genre is chosen", () => {
    expect(moveGenreRequestOf({ parentId: "" })).toEqual({ parentId: null });
    expect(moveGenreRequestOf({})).toEqual({ parentId: null });
  });
});
