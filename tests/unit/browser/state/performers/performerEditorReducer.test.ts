import { describe, expect, it } from "vitest";
import {
  performerDeleteCancelled,
  performerDeleteRequested,
  performerFailed,
  performerLoaded,
  performerRequested,
  performerSaved,
  performerSaveFailed,
  performerSaveStarted,
} from "../../../../../src/browser/state/performers/performerEditorActions.ts";
import { initialPerformerEditorState, performerEditorReducer, preferredNameOf } from "../../../../../src/browser/state/performers/performerEditorReducer.ts";

const name = (id: string, text: string, isPreferred: boolean) => ({ id, name: text, sortName: text, kind: "primary", locale: null, validFrom: null, validTo: null, isPreferred });
const prince = {
  id: "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00",
  kind: "person",
  began: "1958-06-07",
  ended: "2016-04-21",
  area: null,
  disambiguation: null,
  notes: null,
  names: [name("a", "Prince Rogers Nelson", false), name("b", "Prince", true)],
  relations: [],
};

describe("performerEditorReducer", () => {
  it("performer-editor/requested starts a fresh load", () => {
    const state = performerEditorReducer({ ...initialPerformerEditorState, saveFailure: "x" }, performerRequested());
    expect(state).toEqual({ ...initialPerformerEditorState, status: "loading" });
  });
  it("performer-editor/loaded and performer-editor/failed record the result of the load", () => {
    expect(performerEditorReducer(initialPerformerEditorState, performerLoaded(prince))).toMatchObject({ status: "loaded", performer: prince });
    expect(performerEditorReducer(initialPerformerEditorState, performerFailed("not-found"))).toMatchObject({ status: "failed", failure: "not-found" });
  });
  it("performer-editor/save-started, performer-editor/saved and performer-editor/save-failed track a change", () => {
    const saving = performerEditorReducer(initialPerformerEditorState, performerSaveStarted());
    expect(saving).toMatchObject({ saving: true, saveFailure: null });
    expect(performerEditorReducer(saving, performerSaved(prince))).toMatchObject({ saving: false, performer: prince });
    expect(performerEditorReducer(saving, performerSaveFailed("conflict-in-use"))).toMatchObject({ saving: false, saveFailure: "conflict-in-use" });
  });
  it("performer-editor/delete-requested and performer-editor/delete-cancelled toggle the confirmation", () => {
    const confirming = performerEditorReducer(initialPerformerEditorState, performerDeleteRequested());
    expect(confirming.confirmingDelete).toBe(true);
    expect(performerEditorReducer(confirming, performerDeleteCancelled()).confirmingDelete).toBe(false);
    expect(performerEditorReducer(confirming, performerSaveFailed("conflict-in-use")).confirmingDelete).toBe(false);
  });
});

describe("preferredNameOf", () => {
  it("names the performer by its preferred name", () => expect(preferredNameOf(prince)).toBe("Prince"));
});
