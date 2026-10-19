import { describe, expect, it } from "vitest";
import { durationPartsOf } from "../../../src/localization/durationPartsOf.ts";

describe("durationPartsOf", () => {
  it("splits a duration into hours, minutes and seconds", () => {
    expect(durationPartsOf(205000)).toEqual({ hours: 0, minutes: 3, seconds: 25 });
    expect(durationPartsOf(3723000)).toEqual({ hours: 1, minutes: 2, seconds: 3 });
  });
  it("rounds to the nearest second", () => {
    expect(durationPartsOf(205499)).toEqual({ hours: 0, minutes: 3, seconds: 25 });
    expect(durationPartsOf(59500)).toEqual({ hours: 0, minutes: 1, seconds: 0 });
  });
});
