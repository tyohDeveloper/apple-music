// Maps a URL path to the screen it names. Library, performer and recording ids are UUIDs.
export type Route =
  | { readonly name: "sign-in" }
  | { readonly name: "libraries" }
  | { readonly name: "library"; readonly libraryId: string }
  | { readonly name: "performers"; readonly libraryId: string }
  | { readonly name: "performer"; readonly libraryId: string; readonly performerId: string }
  | { readonly name: "recordings"; readonly libraryId: string }
  | { readonly name: "recording"; readonly libraryId: string; readonly recordingId: string }
  | { readonly name: "not-found" };

const uuid = "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})";
const libraryPath = new RegExp(`^/libraries/${uuid}(?:/(performers|recordings)(?:/${uuid})?)?/?$`, "u");

function sectionRoute(libraryId: string, section: string, entityId: string | undefined): Route {
  if (section === "performers") return entityId === undefined ? { name: "performers", libraryId } : { name: "performer", libraryId, performerId: entityId };
  return entityId === undefined ? { name: "recordings", libraryId } : { name: "recording", libraryId, recordingId: entityId };
}

export function parseRoute(path: string): Route {
  if (path === "/" || path === "/libraries" || path === "/libraries/") return { name: "libraries" };
  if (path === "/sign-in") return { name: "sign-in" };
  const match = libraryPath.exec(path);
  if (match?.[1] === undefined) return { name: "not-found" };
  return match[2] === undefined ? { name: "library", libraryId: match[1] } : sectionRoute(match[1], match[2], match[3]);
}
