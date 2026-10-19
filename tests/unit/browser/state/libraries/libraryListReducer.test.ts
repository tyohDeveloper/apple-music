import { describe, expect, it } from "vitest";
import {
  libraryCreated,
  libraryCreateFailed,
  libraryCreateStarted,
  librariesFailed,
  librariesLoaded,
  librariesRequested,
} from "../../../../../src/browser/state/libraries/libraryListActions.ts";
import { initialLibraryListState, libraryListReducer } from "../../../../../src/browser/state/libraries/libraryListReducer.ts";

const main = { id: "03ad7794-f502-4777-883e-c20232d55880", label: "Main", storefront: null, role: "owner" };
const second = { ...main, id: "5e3548e3-1972-4885-b22f-8af0571f8ed3", label: "Second" };

describe("libraryListReducer", () => {
  it("libraries/requested starts loading", () => {
    expect(libraryListReducer(initialLibraryListState, librariesRequested()).status).toBe("loading");
  });
  it("libraries/loaded stores the list", () => {
    const state = libraryListReducer(initialLibraryListState, librariesLoaded([main]));
    expect(state).toMatchObject({ status: "loaded", libraries: [main] });
  });
  it("libraries/failed records the failure", () => {
    expect(libraryListReducer(initialLibraryListState, librariesFailed("network"))).toMatchObject({ status: "failed", failure: "network" });
  });
  it("libraries/create-started marks creation in progress", () => {
    expect(libraryListReducer(initialLibraryListState, libraryCreateStarted())).toMatchObject({ creating: true, createFailure: null });
  });
  it("libraries/created appends the new library", () => {
    const loaded = libraryListReducer(initialLibraryListState, librariesLoaded([main]));
    expect(libraryListReducer(loaded, libraryCreated(second)).libraries).toEqual([main, second]);
  });
  it("libraries/create-failed records the failure", () => {
    expect(libraryListReducer(initialLibraryListState, libraryCreateFailed("validation"))).toMatchObject({
      creating: false,
      createFailure: "validation",
    });
  });
});
