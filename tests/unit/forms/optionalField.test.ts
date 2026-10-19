import { describe, expect, it } from "vitest";
import { optionalField } from "../../../src/forms/optionalField.ts";

describe("optionalField", () => {
  it("trims text and treats blank or absent fields as undefined", () => {
    expect(optionalField({ name: "  Nina  " }, "name")).toBe("Nina");
    expect(optionalField({ name: "   " }, "name")).toBeUndefined();
    expect(optionalField({}, "name")).toBeUndefined();
  });
});
