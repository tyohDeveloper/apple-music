import { describe, expect, it } from "vitest";
import { matchKeyOf } from "../../../src/names/matchKeyOf.ts";

describe("matchKeyOf", () => {
  it.each([
    ["Beyoncé", "beyonce"],
    ["BEYONCE", "beyonce"],
    ["Guns N' Roses", "guns n roses"],
    ["Sigur Rós", "sigur ros"],
    ["  The   Beatles ", "the beatles"],
    ["AC/DC", "ac dc"],
    ["ｆｕｌｌ ｗｉｄｔｈ", "full width"],
    ["Mötley Crüe", "motley crue"],
    ["坂本龍一", "坂本龍一"],
    ["...", ""],
  ])("keys %s as %s", (name, key) => {
    expect(matchKeyOf(name)).toBe(key);
  });
});
