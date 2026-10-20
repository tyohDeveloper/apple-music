import { describe, expect, it } from "vitest";
import { countByLabel } from "../../../src/metrics/countByLabel.ts";

describe("countByLabel", () => {
  it("adds one to the label's counter without changing the original", () => {
    const counts = { succeeded: 2 };
    expect(countByLabel(counts, "succeeded")).toEqual({ succeeded: 3 });
    expect(countByLabel(counts, "failed")).toEqual({ succeeded: 2, failed: 1 });
    expect(counts).toEqual({ succeeded: 2 });
  });
});
