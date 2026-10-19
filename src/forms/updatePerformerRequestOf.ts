// The update-performer request a submitted details form describes: every field is sent, and
// a blank field clears the stored value.
import type { UpdatePerformerRequest } from "../contracts/performers/updatePerformerRequestSchema.ts";
import { nullableField } from "./nullableField.ts";

export function updatePerformerRequestOf(values: Readonly<Record<string, string>>): UpdatePerformerRequest {
  return {
    kind: values["kind"] ?? "",
    began: nullableField(values, "began"),
    ended: nullableField(values, "ended"),
    area: nullableField(values, "area"),
    disambiguation: nullableField(values, "disambiguation"),
    notes: nullableField(values, "notes"),
  };
}
