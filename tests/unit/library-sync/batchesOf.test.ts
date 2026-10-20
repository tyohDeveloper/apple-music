import { describe, expect, it } from "vitest";
import { batchesOf } from "../../../src/library-sync/batchesOf.ts";

describe("batchesOf", () => {
  it("splits items in order into batches of at most the size", () => {
    expect(batchesOf([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(batchesOf(["a", "b"], 300)).toEqual([["a", "b"]]);
    expect(batchesOf([], 100)).toEqual([]);
  });

  it("treats a size below one as one", () => {
    expect(batchesOf([1, 2], 0)).toEqual([[1], [2]]);
  });
});
