import type { Route } from "../../../routing/parseRoute.ts";

export type RouteAction = { readonly type: "route/changed"; readonly route: Route };

export const routeChanged = (route: Route): RouteAction => ({ type: "route/changed", route });
