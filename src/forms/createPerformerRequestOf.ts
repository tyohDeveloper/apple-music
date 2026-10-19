// The create-performer request a submitted form describes; blank optional fields are left out.
import type { CreatePerformerRequest } from "../contracts/performers/createPerformerRequestSchema.ts";
import { optionalField } from "./optionalField.ts";

export function createPerformerRequestOf(values: Readonly<Record<string, string>>): CreatePerformerRequest {
  const sortName = optionalField(values, "sortName");
  return {
    kind: values["kind"] ?? "",
    name: values["name"] ?? "",
    ...(sortName === undefined ? {} : { sortName }),
  };
}
