// Maps a URL path to the screen it names. Library and catalog ids are UUIDs. Editions are
// listed on their album, so /editions alone names no screen.
export type Route =
  | { readonly name: "sign-in" }
  | { readonly name: "libraries" }
  | { readonly name: "library"; readonly libraryId: string }
  | { readonly name: "performers"; readonly libraryId: string }
  | { readonly name: "performer"; readonly libraryId: string; readonly performerId: string }
  | { readonly name: "recordings"; readonly libraryId: string }
  | { readonly name: "recording"; readonly libraryId: string; readonly recordingId: string }
  | { readonly name: "albums"; readonly libraryId: string }
  | { readonly name: "album"; readonly libraryId: string; readonly albumId: string }
  | { readonly name: "edition"; readonly libraryId: string; readonly editionId: string }
  | { readonly name: "not-found" };

const uuid = "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})";
const libraryPath = new RegExp(`^/libraries/${uuid}(?:/(performers|recordings|albums|editions)(?:/${uuid})?)?/?$`, "u");

function entityRoute(libraryId: string, section: string, id: string): Route {
  switch (section) {
    case "performers":
      return { name: "performer", libraryId, performerId: id };
    case "recordings":
      return { name: "recording", libraryId, recordingId: id };
    case "albums":
      return { name: "album", libraryId, albumId: id };
    default:
      return { name: "edition", libraryId, editionId: id };
  }
}

function sectionRoute(libraryId: string, section: string, id: string | undefined): Route {
  if (id !== undefined) return entityRoute(libraryId, section, id);
  if (section === "performers" || section === "recordings" || section === "albums") return { name: section, libraryId };
  return { name: "not-found" };
}

export function parseRoute(path: string): Route {
  if (path === "/" || path === "/libraries" || path === "/libraries/") return { name: "libraries" };
  if (path === "/sign-in") return { name: "sign-in" };
  const match = libraryPath.exec(path);
  if (match?.[1] === undefined) return { name: "not-found" };
  return match[2] === undefined ? { name: "library", libraryId: match[1] } : sectionRoute(match[1], match[2], match[3]);
}
