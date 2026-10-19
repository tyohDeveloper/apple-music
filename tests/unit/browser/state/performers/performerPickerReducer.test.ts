import { describe, expect, it } from "vitest";
import { pickerFailed, pickerLoaded, pickerRequested } from "../../../../../src/browser/state/performers/performerPickerActions.ts";
import { initialPerformerPickerState, performerPickerReducer } from "../../../../../src/browser/state/performers/performerPickerReducer.ts";

const wings = { id: "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00", kind: "group", name: "Wings", sortName: "Wings", disambiguation: null };

describe("performerPickerReducer", () => {
  it("performer-picker/requested starts a search", () => {
    expect(performerPickerReducer(initialPerformerPickerState, pickerRequested()).status).toBe("loading");
  });
  it("performer-picker/loaded replaces the results", () => {
    expect(performerPickerReducer(initialPerformerPickerState, pickerLoaded([wings]))).toEqual({ status: "loaded", results: [wings], failure: null });
  });
  it("performer-picker/failed keeps earlier results and records the failure", () => {
    const loaded = performerPickerReducer(initialPerformerPickerState, pickerLoaded([wings]));
    expect(performerPickerReducer(loaded, pickerFailed("network"))).toMatchObject({ status: "failed", results: [wings], failure: "network" });
  });
});
