import { describe, expect, it } from "vitest";
import { durationMsOf } from "../../../src/forms/durationMsOf.ts";
import { durationTextOf } from "../../../src/forms/durationTextOf.ts";

describe("durationTextOf", () => {
  it("writes m:ss below an hour and h:mm:ss above", () => {
    expect(durationTextOf(205000)).toBe("3:25");
    expect(durationTextOf(7000)).toBe("0:07");
    expect(durationTextOf(3723000)).toBe("1:02:03");
  });
  it("keeps milliseconds only when present", () => expect(durationTextOf(205347)).toBe("3:25.347"));
  it("is blank without a duration", () => expect(durationTextOf(null)).toBe(""));
  it("round-trips through durationMsOf", () => {
    for (const ms of [0, 999, 205347, 3723000, 2147483647]) expect(durationMsOf(durationTextOf(ms))).toBe(ms);
  });
});
