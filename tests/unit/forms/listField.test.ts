import { describe, expect, it } from "vitest";
import { listField } from "../../../src/forms/listField.ts";

describe("listField", () => {
  it("splits on commas and drops blank entries", () => {
    expect(listField({ roles: " vocals, guitar ,, " }, "roles")).toEqual(["vocals", "guitar"]);
    expect(listField({}, "roles")).toEqual([]);
  });
});
