import { describe, expect, it } from "vitest";
import { nullableField } from "../../../src/forms/nullableField.ts";

describe("nullableField", () => {
  it("gives null for a blank field so the stored value is cleared", () => {
    expect(nullableField({ area: "" }, "area")).toBeNull();
    expect(nullableField({ area: " London " }, "area")).toBe("London");
  });
});
