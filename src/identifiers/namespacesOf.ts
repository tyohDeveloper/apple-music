// The external identifier namespaces one kind of entity takes, in the order the formats
// file lists them.
import data from "../../data/identifiers/external-id-formats.json" with { type: "json" };
import type { ExternalIdOwner } from "./externalIdFormatOf.ts";

export function namespacesOf(owner: ExternalIdOwner): string[] {
  return data.formats.filter((format) => format.owner === owner).map((format) => format.namespace);
}
