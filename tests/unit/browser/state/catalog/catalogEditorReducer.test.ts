import { describe, expect, it } from "vitest";
import {
  catalogDeleteCancelled,
  catalogDeleteRequested,
  catalogEntityFailed,
  catalogEntityLoaded,
  catalogEntityRequested,
  catalogSaved,
  catalogSaveFailed,
  catalogSaveStarted,
} from "../../../../../src/browser/state/catalog/catalogEditorActions.ts";
import { catalogEditorReducer, initialCatalogEditorState, type CatalogEditorState } from "../../../../../src/browser/state/catalog/catalogEditorReducer.ts";

type Entity = { readonly id: string; readonly title: string };
const blueTrain: Entity = { id: "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00", title: "Blue Train" };
const initial: CatalogEditorState<Entity> = initialCatalogEditorState;

describe("catalogEditorReducer", () => {
  it("catalog-editor/requested starts loading afresh", () => {
    const state = catalogEditorReducer({ ...initial, saveFailure: "x" }, catalogEntityRequested());
    expect(state).toEqual({ ...initial, status: "loading" });
  });
  it("catalog-editor/loaded and catalog-editor/failed record the outcome of the load", () => {
    expect(catalogEditorReducer(initial, catalogEntityLoaded(blueTrain))).toMatchObject({ status: "loaded", entity: blueTrain });
    expect(catalogEditorReducer(initial, catalogEntityFailed("not-found"))).toMatchObject({ status: "failed", failure: "not-found" });
  });
  it("catalog-editor/save-started, catalog-editor/saved and catalog-editor/save-failed track a change", () => {
    const saving = catalogEditorReducer(initial, catalogSaveStarted());
    expect(saving).toMatchObject({ saving: true, saveFailure: null });
    expect(catalogEditorReducer(saving, catalogSaved(blueTrain))).toMatchObject({ saving: false, entity: blueTrain });
    expect(catalogEditorReducer(saving, catalogSaveFailed("conflict-in-use"))).toMatchObject({ saving: false, saveFailure: "conflict-in-use" });
  });
  it("catalog-editor/delete-requested asks for confirmation; catalog-editor/delete-cancelled and a failure withdraw it", () => {
    const confirming = catalogEditorReducer(initial, catalogDeleteRequested());
    expect(confirming.confirmingDelete).toBe(true);
    expect(catalogEditorReducer(confirming, catalogDeleteCancelled()).confirmingDelete).toBe(false);
    expect(catalogEditorReducer(confirming, catalogSaveFailed("conflict-in-use")).confirmingDelete).toBe(false);
  });
});
