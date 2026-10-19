import { describe, expect, it } from "vitest";
import { countStatusClass } from "../../../src/metrics/countStatusClass.ts";

describe("countStatusClass", () => {
  it("counts by status class without mutating the input", () => {
    const before = { "2xx": 1 };
    const after = countStatusClass(countStatusClass(before, 204), 404);
    expect(after).toEqual({ "2xx": 2, "4xx": 1 });
    expect(before).toEqual({ "2xx": 1 });
  });
});
