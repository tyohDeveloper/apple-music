import { describe, expect, it } from "vitest";
import { preferredNameOf } from "../../../src/names/preferredNameOf.ts";

describe("preferredNameOf", () => {
  it("names the performer by its preferred name", () => {
    expect(preferredNameOf([{ name: "Prince Rogers Nelson", isPreferred: false }, { name: "Prince", isPreferred: true }])).toBe("Prince");
  });
  it("is empty when no name is preferred", () => expect(preferredNameOf([{ name: "Prince", isPreferred: false }])).toBe(""));
});
