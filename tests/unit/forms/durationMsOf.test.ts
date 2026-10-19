import { describe, expect, it } from "vitest";
import { durationMsOf } from "../../../src/forms/durationMsOf.ts";

describe("durationMsOf", () => {
  it("reads m:ss and h:mm:ss", () => {
    expect(durationMsOf("3:25")).toBe(205000);
    expect(durationMsOf("0:07")).toBe(7000);
    expect(durationMsOf("72:10")).toBe(4330000);
    expect(durationMsOf("1:02:03")).toBe(3723000);
  });
  it("reads optional milliseconds", () => {
    expect(durationMsOf("3:25.347")).toBe(205347);
    expect(durationMsOf("3:25.5")).toBe(205500);
  });
  it("treats blank as no duration", () => {
    expect(durationMsOf("")).toBeNull();
    expect(durationMsOf("  ")).toBeNull();
  });
  it("refuses text that is not a duration", () => {
    for (const text of ["3:5", "3:60", "1:60:00", "205", "3:25.1234", "-3:25", "3m25s", "999999:00:00"]) expect(durationMsOf(text)).toBeUndefined();
  });
});
