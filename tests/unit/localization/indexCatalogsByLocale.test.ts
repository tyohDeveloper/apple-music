import { describe, expect, it } from "vitest";
import { indexCatalogsByLocale } from "../../../src/localization/indexCatalogsByLocale.ts";

describe("indexCatalogsByLocale", () => {
  it("keys catalogs by the directory that names the locale", () => {
    const files = { "../../data/locales/en/interface.json": { a: "A" }, "../../data/locales/fr/interface.json": { a: "À" } };
    expect(indexCatalogsByLocale(files)).toEqual({ en: { a: "A" }, fr: { a: "À" } });
  });
});
