import { describe, expect, it } from "vitest";
import { collapseWhitespace } from "../../../src/names/collapseWhitespace.ts";

describe("collapseWhitespace", () => {
  it("trims and collapses runs of whitespace", () => {
    expect(collapseWhitespace("  Second \t  Apple\nID ")).toBe("Second Apple ID");
  });
  it("leaves single-spaced text unchanged", () => {
    expect(collapseWhitespace("John R. Cash")).toBe("John R. Cash");
  });
});
