import { describe, expect, it } from "vitest";
import { selectSupportedLocale } from "../../../src/localization/selectSupportedLocale.ts";

describe("selectSupportedLocale", () => {
  const supported = ["en", "fr", "pt-BR"];
  it("matches a full tag case-insensitively", () => expect(selectSupportedLocale(["pt-br"], supported, "en")).toBe("pt-BR"));
  it("matches on the primary subtag", () => expect(selectSupportedLocale(["fr-CA"], supported, "en")).toBe("fr"));
  it("takes the first supported preference", () => expect(selectSupportedLocale(["de", "fr"], supported, "en")).toBe("fr"));
  it("falls back to the base locale", () => expect(selectSupportedLocale(["ja"], supported, "en")).toBe("en"));
});
