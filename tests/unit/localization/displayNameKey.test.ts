import { describe, expect, it } from "vitest";
import { displayNameKey } from "../../../src/localization/displayNameKey.ts";

describe("displayNameKey", () => {
  it("joins taxonomy and entry id", () => expect(displayNameKey("libraryRole", "owner")).toBe("libraryRole.owner"));
});
