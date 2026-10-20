// The resources in an Apple Music API answer, a library list page or a catalog lookup: each
// resource's attributes as returned, its relationships reduced to the ids they name, and the
// `next` subpath when more pages follow (docs/design/apple-music-import.md, slice H). Null
// when the answer lacks Apple's documented shape, a `data` array of objects with string ids.
// A repeated id keeps its last resource.
export type AppleResource = {
  readonly id: string;
  readonly attributes: Readonly<Record<string, unknown>>;
  readonly relationships: Readonly<Record<string, readonly string[]>>;
};
export type AppleResourcePage = { readonly resources: readonly AppleResource[]; readonly next: string | null };

type Fields = Readonly<Record<string, unknown>>;

const fieldsOf = (value: unknown): Fields | null => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Fields) : null);

function idsOf(relationship: unknown): string[] | null {
  const data = fieldsOf(relationship)?.["data"];
  if (!Array.isArray(data)) return null;
  return data.flatMap((entry) => {
    const id = fieldsOf(entry)?.["id"];
    return typeof id === "string" && id !== "" ? [id] : [];
  });
}

function relationshipsOf(value: unknown): Record<string, readonly string[]> {
  const relationships: Record<string, readonly string[]> = {};
  for (const [name, relationship] of Object.entries(fieldsOf(value) ?? {})) {
    const ids = idsOf(relationship);
    if (ids !== null) relationships[name] = ids;
  }
  return relationships;
}

function resourceOf(value: unknown): AppleResource | null {
  const fields = fieldsOf(value);
  const id = fields?.["id"];
  if (fields === null || typeof id !== "string" || id === "") return null;
  return { id, attributes: fieldsOf(fields["attributes"]) ?? {}, relationships: relationshipsOf(fields["relationships"]) };
}

export function appleResourcesOf(body: unknown): AppleResourcePage | null {
  const data = fieldsOf(body)?.["data"];
  if (!Array.isArray(data)) return null;
  const resources = data.map(resourceOf);
  if (resources.some((resource) => resource === null)) return null;
  const byId = new Map((resources as AppleResource[]).map((resource) => [resource.id, resource]));
  const next = fieldsOf(body)?.["next"];
  return { resources: [...byId.values()], next: typeof next === "string" && next !== "" ? next : null };
}
