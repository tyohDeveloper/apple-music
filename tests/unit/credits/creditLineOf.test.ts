import { describe, expect, it } from "vitest";
import { creditLineOf } from "../../../src/credits/creditLineOf.ts";

const credit = (name: string, role: string, joinPhrase: string | null = null) => ({ name, role, joinPhrase });

describe("creditLineOf", () => {
  it("joins performing credits by their join phrases", () => {
    expect(creditLineOf([credit("Simon", "primary", " & "), credit("Garfunkel", "primary")])).toBe("Simon & Garfunkel");
    expect(creditLineOf([credit("Santana", "primary", " feat. "), credit("Rob Thomas", "featured")])).toBe("Santana feat. Rob Thomas");
  });
  it("separates credits without a join phrase by commas and drops the last join phrase", () => {
    const line = creditLineOf([credit("Itzhak Perlman", "soloist"), credit("Chicago Symphony Orchestra", "orchestra"), credit("Carlo Maria Giulini", "conductor", " / ")]);
    expect(line).toBe("Itzhak Perlman, Chicago Symphony Orchestra, Carlo Maria Giulini");
  });
  it("leaves writer and production credits out of the line", () => {
    expect(creditLineOf([credit("Ludwig van Beethoven", "composer", " — "), credit("Emil Gilels", "soloist"), credit("Producer", "producer")])).toBe("Emil Gilels");
  });
  it("is empty without performing credits", () => {
    expect(creditLineOf([])).toBe("");
    expect(creditLineOf([credit("Ludwig van Beethoven", "composer")])).toBe("");
  });
});
