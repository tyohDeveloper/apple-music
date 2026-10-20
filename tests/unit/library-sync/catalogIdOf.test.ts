import { describe, expect, it } from "vitest";
import { catalogIdOf } from "../../../src/library-sync/catalogIdOf.ts";

describe("catalogIdOf", () => {
  it("prefers the catalog relationship, then the play parameters", () => {
    expect(catalogIdOf({ id: "i.1", attributes: { playParams: { catalogId: "9" } }, relationships: { catalog: ["2001"] } })).toBe("2001");
    expect(catalogIdOf({ id: "i.1", attributes: { playParams: { id: "i.1", catalogId: "2002" } }, relationships: { catalog: [] } })).toBe("2002");
  });

  it("answers null for an uploaded or unmatched song", () => {
    expect(catalogIdOf({ id: "i.2", attributes: { playParams: { id: "i.2", kind: "song" } }, relationships: {} })).toBeNull();
    expect(catalogIdOf({ id: "i.3", attributes: { playParams: { catalogId: "" } }, relationships: {} })).toBeNull();
    expect(catalogIdOf({ id: "i.4", attributes: {}, relationships: {} })).toBeNull();
  });
});
