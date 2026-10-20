import { describe, expect, it } from "vitest";
import { pickerFailed, pickerLoaded, pickerRequested } from "../../../../../src/browser/state/catalog/catalogPickerActions.ts";
import { catalogPickerReducer, initialCatalogPickerState, type CatalogPickerState } from "../../../../../src/browser/state/catalog/catalogPickerReducer.ts";

const wings = { id: "5f0c2a9e-8f6d-4c3b-9a1e-2d7b6c4e1f00", name: "Wings" };
const initial: CatalogPickerState<typeof wings> = initialCatalogPickerState;

describe("catalogPickerReducer", () => {
  it("catalog-picker/requested starts a search", () => {
    expect(catalogPickerReducer(initial, pickerRequested()).status).toBe("loading");
  });
  it("catalog-picker/loaded replaces the results", () => {
    expect(catalogPickerReducer(initial, pickerLoaded([wings]))).toEqual({ status: "loaded", results: [wings], failure: null });
  });
  it("catalog-picker/failed keeps earlier results and records the failure", () => {
    const loaded = catalogPickerReducer(initial, pickerLoaded([wings]));
    expect(catalogPickerReducer(loaded, pickerFailed("network"))).toMatchObject({ status: "failed", results: [wings], failure: "network" });
  });
});
