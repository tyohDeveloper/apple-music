// One external identifier: a namespace from data/taxonomies/external-id-namespaces.json and
// a value. Whether the entity takes the namespace, and the value's form, are checked by the
// route against data/identifiers/external-id-formats.json.
import Type from "typebox";
import namespaces from "../../../data/taxonomies/external-id-namespaces.json" with { type: "json" };

export const externalIdSchema = Type.Object(
  { namespace: Type.String({ enum: namespaces.entries.map((entry) => entry.id) }), value: Type.String({ minLength: 1, maxLength: 100 }) },
  { additionalProperties: false },
);

export type ExternalId = Type.Static<typeof externalIdSchema>;
