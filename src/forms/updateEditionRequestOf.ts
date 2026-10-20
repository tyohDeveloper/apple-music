// The update-edition request a submitted details form describes: every field is sent, and a
// blank field clears the stored value. Moving an edition to another album is its own request.
import type { UpdateEditionRequest } from "../contracts/editions/updateEditionRequestSchema.ts";
import { nullableField } from "./nullableField.ts";

export function updateEditionRequestOf(values: Readonly<Record<string, string>>): UpdateEditionRequest {
  return {
    title: values["title"] ?? "",
    kind: values["kind"] ?? "",
    released: nullableField(values, "released"),
    notes: nullableField(values, "notes"),
  };
}
