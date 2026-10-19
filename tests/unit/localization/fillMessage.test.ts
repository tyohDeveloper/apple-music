import { describe, expect, it } from "vitest";
import { fillMessage } from "../../../src/localization/fillMessage.ts";

describe("fillMessage", () => {
  it("replaces known placeholders", () => expect(fillMessage("Signed in as {name}", { name: "Ann" })).toBe("Signed in as Ann"));
  it("keeps unknown placeholders", () => expect(fillMessage("{a} and {b}", { a: "x" })).toBe("x and {b}"));
});
