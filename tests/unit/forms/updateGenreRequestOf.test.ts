import { describe, expect, it } from "vitest";
import { updateGenreRequestOf } from "../../../src/forms/updateGenreRequestOf.ts";

describe("updateGenreRequestOf", () => {
  it("sends the name, and blank notes as null", () => {
    expect(updateGenreRequestOf({ name: "Hard bop", notes: "" })).toEqual({ name: "Hard bop", notes: null });
    expect(updateGenreRequestOf({ name: "Hard bop", notes: " After bebop " })).toEqual({ name: "Hard bop", notes: "After bebop" });
  });
});
