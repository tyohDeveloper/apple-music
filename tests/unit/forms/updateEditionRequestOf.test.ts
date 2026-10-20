import { describe, expect, it } from "vitest";
import { updateEditionRequestOf } from "../../../src/forms/updateEditionRequestOf.ts";

describe("updateEditionRequestOf", () => {
  it("sends every field, with blanks as null", () => {
    expect(updateEditionRequestOf({ title: "Kind of Blue (Legacy Edition)", kind: "expanded", released: "", notes: " Two discs " })).toEqual({
      title: "Kind of Blue (Legacy Edition)",
      kind: "expanded",
      released: null,
      notes: "Two discs",
    });
  });
});
