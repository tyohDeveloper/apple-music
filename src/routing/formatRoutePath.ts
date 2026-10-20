// The inverse of parseRoute: the URL path for a screen.
import type { Route } from "./parseRoute.ts";

type LibraryRoute = Exclude<Route, { readonly name: "sign-in" | "libraries" | "not-found" }>;

function sectionPathOf(route: LibraryRoute): string {
  switch (route.name) {
    case "library":
      return "";
    case "performers":
    case "recordings":
    case "albums":
    case "genres":
    case "apple-music":
      return `/${route.name}`;
    case "performer":
      return `/performers/${route.performerId}`;
    case "recording":
      return `/recordings/${route.recordingId}`;
    case "album":
      return `/albums/${route.albumId}`;
    case "edition":
      return `/editions/${route.editionId}`;
    case "genre":
      return `/genres/${route.genreId}`;
  }
}

export function formatRoutePath(route: Route): string {
  if (route.name === "sign-in" || route.name === "libraries" || route.name === "not-found") return `/${route.name}`;
  return `/libraries/${route.libraryId}${sectionPathOf(route)}`;
}
