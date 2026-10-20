import { describe, expect, it } from "vitest";
import { createEditionRequestOf } from "../../../src/forms/createEditionRequestOf.ts";

describe("createEditionRequestOf", () => {
  it("sends the title, kind and a release date when given", () => {
    expect(createEditionRequestOf({ title: "Kind of Blue (Legacy Edition)", kind: "expanded", released: "2009" })).toEqual({ title: "Kind of Blue (Legacy Edition)", kind: "expanded", released: "2009" });
  });
  it("leaves out a blank release date", () => expect(createEditionRequestOf({ title: "Kind of Blue", kind: "original", released: "" })).toEqual({ title: "Kind of Blue", kind: "original" }));
});
