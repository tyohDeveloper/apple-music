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
  it("reads the performer list and one performer", () => {
    const performerId = "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00";
    expect(parseRoute(`/libraries/${id}/performers`)).toEqual({ name: "performers", libraryId: id });
    expect(parseRoute(`/libraries/${id}/performers/${performerId}/`)).toEqual({ name: "performer", libraryId: id, performerId });
    expect(parseRoute(`/libraries/${id}/performers/not-a-uuid`)).toEqual({ name: "not-found" });
  });
  it("reads the recording list and one recording", () => {
    const recordingId = "9b2d4f6a-1c3e-4a5b-8d7f-0e2c4a6b8d00";
    expect(parseRoute(`/libraries/${id}/recordings/`)).toEqual({ name: "recordings", libraryId: id });
    expect(parseRoute(`/libraries/${id}/recordings/${recordingId}`)).toEqual({ name: "recording", libraryId: id, recordingId });
    expect(parseRoute(`/libraries/${id}/albums`)).toEqual({ name: "not-found" });
  });
  it("rejects malformed ids and unknown paths", () => {
    expect(parseRoute("/libraries/not-a-uuid")).toEqual({ name: "not-found" });
    expect(parseRoute("/elsewhere")).toEqual({ name: "not-found" });
  });
});
