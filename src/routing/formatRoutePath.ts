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
    case "not-found":
      return "/not-found";
  }
}
