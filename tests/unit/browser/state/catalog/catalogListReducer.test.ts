import { describe, expect, it } from "vitest";
import {
  catalogCreated,
  catalogCreateFailed,
  catalogCreateStarted,
  catalogListFailed,
  catalogListLoaded,
  catalogListRequested,
} from "../../../../../src/browser/state/catalog/catalogListActions.ts";
import { catalogListReducer, initialCatalogListState, pageRangeOf, type CatalogListState } from "../../../../../src/browser/state/catalog/catalogListReducer.ts";

type Item = { readonly id: string; readonly name: string };
const nina: Item = { id: "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00", name: "Nina Simone" };
const initial: CatalogListState<Item> = initialCatalogListState;

describe("catalogListReducer", () => {
  it("catalog-list/requested records the search and window", () => {
    const state = catalogListReducer(initial, catalogListRequested("nina", 25));
    expect(state).toMatchObject({ status: "loading", query: "nina", offset: 25, failure: null });
  });
  it("catalog-list/loaded stores one page of results", () => {
    const state = catalogListReducer(initial, catalogListLoaded({ items: [nina], total: 1 }));
    expect(state).toMatchObject({ status: "loaded", items: [nina], total: 1 });
  });
  it("catalog-list/failed records the failure", () => {
    expect(catalogListReducer(initial, catalogListFailed("network"))).toMatchObject({ status: "failed", failure: "network" });
  });
  it("catalog-list/create-started, catalog-list/create-failed and catalog-list/created track creation", () => {
    const started = catalogListReducer(initial, catalogCreateStarted());
    expect(started).toMatchObject({ creating: true, createFailure: null });
    expect(catalogListReducer(started, catalogCreateFailed("validation"))).toMatchObject({ creating: false, createFailure: "validation" });
    expect(catalogListReducer(started, catalogCreated()).creating).toBe(false);
  });
});

describe("pageRangeOf", () => {
  it("gives the 1-based range on screen and whether more pages exist", () => {
    const requested = catalogListReducer(initial, catalogListRequested("", 25));
    const loaded = catalogListReducer(requested, catalogListLoaded({ items: [nina], total: 30 }));
    expect(pageRangeOf(loaded)).toEqual({ from: 26, to: 26, total: 30, hasPrevious: true, hasNext: true });
    expect(pageRangeOf(initial)).toEqual({ from: 0, to: 0, total: 0, hasPrevious: false, hasNext: false });
  });
});
