import { describe, expect, it } from "vitest";
import { createPerformerNameRequestOf } from "../../../src/forms/createPerformerNameRequestOf.ts";

describe("createPerformerNameRequestOf", () => {
  it("includes only filled optional fields and reads the preferred checkbox", () => {
    expect(createPerformerNameRequestOf({ name: "Eunice Waymon", kind: "birth", sortName: "", locale: "", validFrom: "1933", validTo: "" })).toEqual({
      name: "Eunice Waymon",
      kind: "birth",
      validFrom: "1933",
      isPreferred: false,
    });
    expect(createPerformerNameRequestOf({ name: "Nina Simone", kind: "stage", isPreferred: "on" }).isPreferred).toBe(true);
  });
});
