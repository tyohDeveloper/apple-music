// The form an external identifier takes for one kind of entity in one namespace, from
// data/identifiers/external-id-formats.json; undefined when that kind does not take it.
import data from "../../data/identifiers/external-id-formats.json" with { type: "json" };

export type ExternalIdOwner = "performer" | "album" | "edition" | "recording";
export type ExternalIdNormalization = "remove-separators" | "upper-case" | "lower-case";
export type ExternalIdFormat = {
  readonly owner: ExternalIdOwner;
  readonly namespace: string;
  readonly pattern: string;
  readonly normalize: readonly ExternalIdNormalization[];
  readonly link?: string;
};

const formats = data.formats as readonly ExternalIdFormat[];

export function externalIdFormatOf(owner: ExternalIdOwner, namespace: string): ExternalIdFormat | undefined {
  return formats.find((format) => format.owner === owner && format.namespace === namespace);
}
