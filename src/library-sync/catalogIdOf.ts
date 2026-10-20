// The catalog id of a library resource: the first id of its `catalog` relationship, else the
// `catalogId` of its play parameters, else null (an uploaded song or one Apple has not
// matched). Either may be missing depending on what Apple returned.
import type { AppleResource } from "./appleResourcesOf.ts";

function playParamsCatalogIdOf(attributes: AppleResource["attributes"]): string | null {
  const playParams = attributes["playParams"];
  if (typeof playParams !== "object" || playParams === null || !("catalogId" in playParams)) return null;
  const { catalogId } = playParams;
  return typeof catalogId === "string" && catalogId !== "" ? catalogId : null;
}

export function catalogIdOf(resource: AppleResource): string | null {
  return resource.relationships["catalog"]?.[0] ?? playParamsCatalogIdOf(resource.attributes);
}
