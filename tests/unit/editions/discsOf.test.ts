import { describe, expect, it } from "vitest";
import { discsOf } from "../../../src/editions/discsOf.ts";

describe("discsOf", () => {
  it("splits tracks into their discs in order", () => {
    const tracks = [{ discIndex: 0, title: "A" }, { discIndex: 0, title: "B" }, { discIndex: 1, title: "C" }];
    expect(discsOf(tracks).map((disc) => disc.map((track) => track.title))).toEqual([["A", "B"], ["C"]]);
  });
  it("closes gaps between disc indexes and gives no discs for no tracks", () => {
    expect(discsOf([{ discIndex: 2, title: "Z" }])).toEqual([[{ discIndex: 2, title: "Z" }]]);
    expect(discsOf([])).toEqual([]);
  });
});
