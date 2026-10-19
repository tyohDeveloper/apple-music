import { describe, expect, it } from "vitest";
import { isPartialDate } from "../../../src/partial-dates/isPartialDate.ts";

describe("isPartialDate", () => {
  it.each(["1969", "1969-07", "1969-07-20", "2024-02-29", "2000-02-29", "0001"])("accepts %s", (text) => {
    expect(isPartialDate(text)).toBe(true);
  });

  it.each(["", "69", "1969-7", "1969-13", "1969-00", "1969-07-32", "2023-02-29", "1900-02-29", "0000", "1969-07-20T00:00", " 1969"])(
    "rejects %s",
    (text) => {
      expect(isPartialDate(text)).toBe(false);
    },
  );
});
