// The update-recording request a submitted details form describes: every field is sent, and
// a blank field clears the stored value. A duration that does not parse makes the form
// invalid (null), so nothing is sent.
import type { UpdateRecordingRequest } from "../contracts/recordings/updateRecordingRequestSchema.ts";
import { durationMsOf } from "./durationMsOf.ts";
import { nullableField } from "./nullableField.ts";

export function updateRecordingRequestOf(values: Readonly<Record<string, string>>): UpdateRecordingRequest | null {
  const durationMs = durationMsOf(values["duration"] ?? "");
  if (durationMs === undefined) return null;
  return {
    title: values["title"] ?? "",
    versionNote: nullableField(values, "versionNote"),
    kind: values["kind"] ?? "",
    recordedFrom: nullableField(values, "recordedFrom"),
    recordedTo: nullableField(values, "recordedTo"),
    venue: nullableField(values, "venue"),
    durationMs,
    notes: nullableField(values, "notes"),
  };
}
