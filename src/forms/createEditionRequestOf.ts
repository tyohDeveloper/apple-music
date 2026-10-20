// The create-edition request a submitted form describes; a blank release date is left out.
import type { CreateEditionRequest } from "../contracts/editions/createEditionRequestSchema.ts";
import { optionalField } from "./optionalField.ts";

export function createEditionRequestOf(values: Readonly<Record<string, string>>): CreateEditionRequest {
  const released = optionalField(values, "released");
  return {
    title: values["title"] ?? "",
    kind: values["kind"] ?? "",
    ...(released === undefined ? {} : { released }),
  };
}
