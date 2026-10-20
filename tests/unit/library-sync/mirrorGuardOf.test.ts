import { describe, expect, it } from "vitest";
import { mirrorGuardOf } from "../../../src/library-sync/mirrorGuardOf.ts";

describe("mirrorGuardOf", () => {
  it("proceeds on a first run, or when the listing shares items with the mirror", () => {
    expect(mirrorGuardOf({ storedBefore: 0, reseen: 0, replaceMirror: false })).toBe("proceed");
    expect(mirrorGuardOf({ storedBefore: 500, reseen: 1, replaceMirror: false })).toBe("proceed");
  });

  it("stops when a listing shares nothing with a mirror that holds items, an empty listing included", () => {
    expect(mirrorGuardOf({ storedBefore: 500, reseen: 0, replaceMirror: false })).toBe("needs-confirmation");
  });

  it("proceeds when the owner asked to replace the mirror", () => {
    expect(mirrorGuardOf({ storedBefore: 500, reseen: 0, replaceMirror: true })).toBe("proceed");
  });
});
