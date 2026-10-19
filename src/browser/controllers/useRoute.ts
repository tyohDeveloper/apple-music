// Keeps the route in STATE in step with the address bar (history API).
import { useCallback, useEffect, useReducer } from "preact/hooks";
import { formatRoutePath } from "../../routing/formatRoutePath.ts";
import { parseRoute, type Route } from "../../routing/parseRoute.ts";
import { routeChanged } from "../state/route/routeActions.ts";
import { initialRouteState, routeReducer } from "../state/route/routeReducer.ts";

export type RouteControls = { readonly route: Route; readonly navigate: (route: Route) => void };

export function useRoute(): RouteControls {
  const [state, dispatch] = useReducer(routeReducer, undefined, () =>
    initialRouteState(parseRoute(window.location.pathname)),
  );
  useEffect(() => {
    const onPopState = (): void => dispatch(routeChanged(parseRoute(window.location.pathname)));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = useCallback((route: Route) => {
    window.history.pushState(null, "", formatRoutePath(route));
    dispatch(routeChanged(route));
  }, []);
  return { route: state.route, navigate };
}
