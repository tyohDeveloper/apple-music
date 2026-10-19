import { describe, expect, it } from "vitest";
import { resolveMessage } from "../../../src/localization/resolveMessage.ts";

describe("resolveMessage", () => {
  const requested = { greeting: "Bonjour" };
  const base = { greeting: "Hello", farewell: "Goodbye" };
  it("prefers the requested locale", () => expect(resolveMessage([requested, base], "greeting")).toBe("Bonjour"));
  it("falls back to the base locale", () => expect(resolveMessage([requested, base], "farewell")).toBe("Goodbye"));
  it("falls back to the raw key", () => expect(resolveMessage([requested, base], "missing.key")).toBe("missing.key"));
});
