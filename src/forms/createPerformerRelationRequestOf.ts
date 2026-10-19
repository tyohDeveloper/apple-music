// The add-relation request a submitted form describes. Roles are comma-separated.
import type { CreatePerformerRelationRequest } from "../contracts/performers/createPerformerRelationRequestSchema.ts";
import { listField } from "./listField.ts";

export function createPerformerRelationRequestOf(values: Readonly<Record<string, string>>): CreatePerformerRelationRequest {
  return {
    kind: values["kind"] ?? "",
    objectId: values["objectId"] ?? "",
    roles: listField(values, "roles"),
  };
}
