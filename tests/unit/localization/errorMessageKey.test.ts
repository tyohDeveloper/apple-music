import { describe, expect, it } from "vitest";
import { errorMessageKey } from "../../../src/localization/errorMessageKey.ts";

describe("errorMessageKey", () => {
  it("places failure codes under errors.", () => expect(errorMessageKey("network")).toBe("errors.network"));
});
