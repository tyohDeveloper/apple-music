import { describe, expect, it } from "vitest";
import { genreIdsAfter } from "../../../../../src/browser/state/genres/genreIdsAfter.ts";

const ids = ["cool", "jazz", "bebop"];

describe("genreIdsAfter", () => {
  it("adds a genre at the end, once", () => {
    expect(genreIdsAfter(ids, { kind: "added", genreId: "blues" })).toEqual(["cool", "jazz", "bebop", "blues"]);
    expect(genreIdsAfter(ids, { kind: "added", genreId: "jazz" })).toEqual(ids);
  });

  it("moves a genre up or down, and not past either end", () => {
    expect(genreIdsAfter(ids, { kind: "moved", index: 1, offset: -1 })).toEqual(["jazz", "cool", "bebop"]);
    expect(genreIdsAfter(ids, { kind: "moved", index: 1, offset: 1 })).toEqual(["cool", "bebop", "jazz"]);
    expect(genreIdsAfter(ids, { kind: "moved", index: 0, offset: -1 })).toEqual(ids);
    expect(genreIdsAfter(ids, { kind: "moved", index: 2, offset: 1 })).toEqual(ids);
  });

  it("removes the genre at a position", () => {
    expect(genreIdsAfter(ids, { kind: "removed", index: 0 })).toEqual(["jazz", "bebop"]);
  });
});
