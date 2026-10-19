// The add-name request a submitted form describes; blank optional fields are left out and
// the preferred checkbox is on when its field is present.
import type { CreatePerformerNameRequest } from "../contracts/performers/createPerformerNameRequestSchema.ts";
import { optionalField } from "./optionalField.ts";

export function createPerformerNameRequestOf(values: Readonly<Record<string, string>>): CreatePerformerNameRequest {
  const optional = { sortName: optionalField(values, "sortName"), locale: optionalField(values, "locale"), validFrom: optionalField(values, "validFrom"), validTo: optionalField(values, "validTo") };
  const present = Object.fromEntries(Object.entries(optional).filter(([, value]) => value !== undefined));
  return {
    name: values["name"] ?? "",
    kind: values["kind"] ?? "",
    ...present,
    isPreferred: values["isPreferred"] !== undefined,
  };
}
