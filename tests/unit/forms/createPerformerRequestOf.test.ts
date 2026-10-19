import { describe, expect, it } from "vitest";
import { createPerformerRequestOf } from "../../../src/forms/createPerformerRequestOf.ts";

describe("createPerformerRequestOf", () => {
  it("keeps kind and name and leaves out a blank sort name", () => {
    expect(createPerformerRequestOf({ kind: "group", name: "The Beatles", sortName: " " })).toEqual({ kind: "group", name: "The Beatles" });
    expect(createPerformerRequestOf({ kind: "group", name: "The Beatles", sortName: "Beatles, The" })).toEqual({
      kind: "group",
      name: "The Beatles",
      sortName: "Beatles, The",
    });
  });
});
