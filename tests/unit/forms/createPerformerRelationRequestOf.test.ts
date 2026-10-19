import { describe, expect, it } from "vitest";
import { createPerformerRelationRequestOf } from "../../../src/forms/createPerformerRelationRequestOf.ts";

describe("createPerformerRelationRequestOf", () => {
  it("reads the kind, the chosen performer and comma-separated roles", () => {
    expect(createPerformerRelationRequestOf({ kind: "member-of", objectId: "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00", roles: "vocals, guitar" })).toEqual({
      kind: "member-of",
      objectId: "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00",
      roles: ["vocals", "guitar"],
    });
  });
});
