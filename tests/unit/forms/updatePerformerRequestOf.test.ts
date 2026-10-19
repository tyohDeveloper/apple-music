import { describe, expect, it } from "vitest";
import { updatePerformerRequestOf } from "../../../src/forms/updatePerformerRequestOf.ts";

describe("updatePerformerRequestOf", () => {
  it("sends every field, with blanks as null", () => {
    expect(updatePerformerRequestOf({ kind: "person", began: "1933-02-21", ended: "", area: " Tryon ", disambiguation: "", notes: "" })).toEqual({
      kind: "person",
      began: "1933-02-21",
      ended: null,
      area: "Tryon",
      disambiguation: null,
      notes: null,
    });
  });
});
