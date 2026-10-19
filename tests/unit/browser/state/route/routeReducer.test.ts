import { describe, expect, it } from "vitest";
import { routeChanged } from "../../../../../src/browser/state/route/routeActions.ts";
import { initialRouteState, routeReducer } from "../../../../../src/browser/state/route/routeReducer.ts";

describe("routeReducer", () => {
  it("route/changed replaces the route", () => {
    const state = routeReducer(initialRouteState({ name: "libraries" }), routeChanged({ name: "sign-in" }));
    expect(state).toEqual({ route: { name: "sign-in" } });
  });
});
