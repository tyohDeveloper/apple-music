import { describe, expect, it } from "vitest";
import {
  performerCreated,
  performerCreateFailed,
  performerCreateStarted,
  performerListFailed,
  performerListLoaded,
  performerListRequested,
} from "../../../../../src/browser/state/performers/performerListActions.ts";
import { initialPerformerListState, pageRangeOf, performerListReducer } from "../../../../../src/browser/state/performers/performerListReducer.ts";

const nina = { id: "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00", kind: "person", name: "Nina Simone", sortName: "Simone, Nina", disambiguation: null };

describe("performerListReducer", () => {
  it("performer-list/requested records the search and window", () => {
    const state = performerListReducer(initialPerformerListState, performerListRequested("nina", 25));
    expect(state).toMatchObject({ status: "loading", query: "nina", offset: 25, failure: null });
  });
  it("performer-list/loaded stores one page of results", () => {
    const state = performerListReducer(initialPerformerListState, performerListLoaded({ items: [nina], total: 1 }));
    expect(state).toMatchObject({ status: "loaded", items: [nina], total: 1 });
  });
  it("performer-list/failed records the failure", () => {
    expect(performerListReducer(initialPerformerListState, performerListFailed("network"))).toMatchObject({ status: "failed", failure: "network" });
  });
  it("performer-list/create-started, performer-list/create-failed and performer-list/created track creation", () => {
    const started = performerListReducer(initialPerformerListState, performerCreateStarted());
    expect(started).toMatchObject({ creating: true, createFailure: null });
    expect(performerListReducer(started, performerCreateFailed("validation"))).toMatchObject({ creating: false, createFailure: "validation" });
    expect(performerListReducer(started, performerCreated()).creating).toBe(false);
  });
});

describe("pageRangeOf", () => {
  it("gives the 1-based range on screen and whether more pages exist", () => {
    const requested = performerListReducer(initialPerformerListState, performerListRequested("", 25));
    const loaded = performerListReducer(requested, performerListLoaded({ items: [nina], total: 30 }));
    expect(pageRangeOf(loaded)).toEqual({ from: 26, to: 26, total: 30, hasPrevious: true, hasNext: true });
    expect(pageRangeOf(initialPerformerListState)).toEqual({ from: 0, to: 0, total: 0, hasPrevious: false, hasNext: false });
  });
});
