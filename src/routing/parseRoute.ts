// Maps a URL path to the screen it names. Library ids are UUIDs.
export type Route =
  | { readonly name: "sign-in" }
  | { readonly name: "libraries" }
  | { readonly name: "library"; readonly libraryId: string }
  | { readonly name: "not-found" };

const libraryPath = /^\/libraries\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/u;

export function parseRoute(path: string): Route {
  if (path === "/" || path === "/libraries" || path === "/libraries/") return { name: "libraries" };
  if (path === "/sign-in") return { name: "sign-in" };
  const library = libraryPath.exec(path);
  if (library?.[1] !== undefined) return { name: "library", libraryId: library[1] };
  return { name: "not-found" };
}
