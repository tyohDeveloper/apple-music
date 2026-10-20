// The inverse of parseRoute: the URL path for a screen.
import type { Route } from "./parseRoute.ts";

export function formatRoutePath(route: Route): string {
  switch (route.name) {
    case "sign-in":
      return "/sign-in";
    case "libraries":
      return "/libraries";
    case "library":
      return `/libraries/${route.libraryId}`;
    case "performers":
      return `/libraries/${route.libraryId}/performers`;
    case "performer":
      return `/libraries/${route.libraryId}/performers/${route.performerId}`;
    case "recordings":
      return `/libraries/${route.libraryId}/recordings`;
    case "recording":
      return `/libraries/${route.libraryId}/recordings/${route.recordingId}`;
    case "albums":
      return `/libraries/${route.libraryId}/albums`;
    case "album":
      return `/libraries/${route.libraryId}/albums/${route.albumId}`;
    case "edition":
      return `/libraries/${route.libraryId}/editions/${route.editionId}`;
    case "not-found":
      return "/not-found";
  }
}
