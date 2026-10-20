// The create-recording request a submitted form describes; blank optional fields are left out.
import type { CreateRecordingRequest } from "../contracts/recordings/createRecordingRequestSchema.ts";
import { optionalField } from "./optionalField.ts";

export function createRecordingRequestOf(values: Readonly<Record<string, string>>): CreateRecordingRequest {
  const versionNote = optionalField(values, "versionNote");
  return {
    title: values["title"] ?? "",
    kind: values["kind"] ?? "",
    ...(versionNote === undefined ? {} : { versionNote }),
  };
}
