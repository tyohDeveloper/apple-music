import { describe, expect, it } from "vitest";
import { formatRoutePath } from "../../../src/routing/formatRoutePath.ts";
import { parseRoute, type Route } from "../../../src/routing/parseRoute.ts";

const routes: readonly Route[] = [
  { name: "sign-in" },
  { name: "libraries" },
  { name: "library", libraryId: "03ad7794-f502-4777-883e-c20232d55880" },
  { name: "performers", libraryId: "03ad7794-f502-4777-883e-c20232d55880" },
  { name: "performer", libraryId: "03ad7794-f502-4777-883e-c20232d55880", performerId: "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00" },
];

describe("formatRoutePath", () => {
  it("round-trips through parseRoute", () => {
    for (const route of routes) expect(parseRoute(formatRoutePath(route))).toEqual(route);
  });
  it("formats not-found", () => expect(formatRoutePath({ name: "not-found" })).toBe("/not-found"));
});
