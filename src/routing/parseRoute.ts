// Maps a URL path to the screen it names. Library and performer ids are UUIDs.
export type Route =
  | { readonly name: "sign-in" }
  | { readonly name: "libraries" }
  | { readonly name: "library"; readonly libraryId: string }
  | { readonly name: "performers"; readonly libraryId: string }
  | { readonly name: "performer"; readonly libraryId: string; readonly performerId: string }
  | { readonly name: "not-found" };

const uuid = "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})";
const libraryPath = new RegExp(`^/libraries/${uuid}(?:/(performers)(?:/${uuid})?)?/?$`, "u");

function libraryRoute(libraryId: string, section: string | undefined, entityId: string | undefined): Route {
  if (section === undefined) return { name: "library", libraryId };
  return entityId === undefined ? { name: "performers", libraryId } : { name: "performer", libraryId, performerId: entityId };
}

export function parseRoute(path: string): Route {
  if (path === "/" || path === "/libraries" || path === "/libraries/") return { name: "libraries" };
  if (path === "/sign-in") return { name: "sign-in" };
  const match = libraryPath.exec(path);
  if (match?.[1] !== undefined) return libraryRoute(match[1], match[2], match[3]);
  return { name: "not-found" };
}
