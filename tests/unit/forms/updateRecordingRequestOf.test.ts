import { describe, expect, it } from "vitest";
import { updateRecordingRequestOf } from "../../../src/forms/updateRecordingRequestOf.ts";

const form = { title: "So What", versionNote: "", kind: "studio", recordedFrom: "1959-03-02", recordedTo: "", venue: " New York ", duration: "9:22", notes: "" };

describe("updateRecordingRequestOf", () => {
  it("sends every field, with blanks as null and the duration in milliseconds", () => {
    expect(updateRecordingRequestOf(form)).toEqual({
      title: "So What",
      versionNote: null,
      kind: "studio",
      recordedFrom: "1959-03-02",
      recordedTo: null,
      venue: "New York",
      durationMs: 562000,
      notes: null,
    });
  });
  it("clears a blank duration", () => expect(updateRecordingRequestOf({ ...form, duration: "" })?.durationMs).toBeNull());
  it("is invalid when the duration does not parse", () => expect(updateRecordingRequestOf({ ...form, duration: "nine minutes" })).toBeNull());
});
