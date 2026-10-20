import { describe, expect, it } from "vitest";
import { createRecordingRequestOf } from "../../../src/forms/createRecordingRequestOf.ts";

describe("createRecordingRequestOf", () => {
  it("sends the title, kind and a version note when given", () => {
    expect(createRecordingRequestOf({ title: "So What", kind: "live", versionNote: " Stockholm " })).toEqual({ title: "So What", kind: "live", versionNote: "Stockholm" });
  });
  it("leaves out a blank version note", () => {
    expect(createRecordingRequestOf({ title: "So What", kind: "studio", versionNote: "" })).toEqual({ title: "So What", kind: "studio" });
  });
});
