import type { Route } from "../../../routing/parseRoute.ts";
import type { RouteAction } from "./routeActions.ts";

export type RouteState = { readonly route: Route };

export function initialRouteState(route: Route): RouteState {
  return { route };
}

export function routeReducer(_state: RouteState, action: RouteAction): RouteState {
  switch (action.type) {
    case "route/changed":
      return { route: action.route };
  }
}
