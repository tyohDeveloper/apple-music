import { describe, expect, it } from "vitest";
import { parseRoute } from "../../../src/routing/parseRoute.ts";

const id = "03ad7794-f502-4777-883e-c20232d55880";

describe("parseRoute", () => {
  it("treats the root and /libraries as the library list", () => {
    expect(parseRoute("/")).toEqual({ name: "libraries" });
    expect(parseRoute("/libraries/")).toEqual({ name: "libraries" });
  });
  it("reads a library id", () => expect(parseRoute(`/libraries/${id}`)).toEqual({ name: "library", libraryId: id }));
  it("recognizes sign-in", () => expect(parseRoute("/sign-in")).toEqual({ name: "sign-in" }));
  it("rejects malformed ids and unknown paths", () => {
    expect(parseRoute("/libraries/not-a-uuid")).toEqual({ name: "not-found" });
    expect(parseRoute("/elsewhere")).toEqual({ name: "not-found" });
  });
});
