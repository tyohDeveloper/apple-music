import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { openToken, sealToken, tokenKeyOf } from "../../../src/platform/tokenCipher.ts";

const key = tokenKeyOf(randomBytes(32).toString("base64"));
const library = "6f1c2c8e-3a3b-4d6e-9a51-0d6a2f1b7c11";
const other = "0b8e2f51-6d7a-4c39-8e21-5f4a3b2c1d00";

describe("token cipher", () => {
  it("opens what it sealed, with a fresh nonce each time", () => {
    const first = sealToken(key, library, "music-user-token");
    expect(first.startsWith("v1.")).toBe(true);
    expect(first).not.toContain("music-user-token");
    expect(sealToken(key, library, "music-user-token")).not.toBe(first);
    expect(openToken([key], library, first)).toBe("music-user-token");
  });

  it("refuses a token sealed for another library, altered, or under an unknown key", () => {
    const sealed = sealToken(key, library, "music-user-token");
    expect(() => openToken([key], other, sealed)).toThrow();
    const [version, nonce, tag, ciphertext] = sealed.split(".");
    const flipped = `${ciphertext?.startsWith("A") ? "B" : "A"}${ciphertext?.slice(1)}`;
    expect(() => openToken([key], library, [version, nonce, tag, flipped].join("."))).toThrow();
    expect(() => openToken([tokenKeyOf(randomBytes(32).toString("base64"), 2)], library, sealed)).toThrow();
  });

  it("opens tokens sealed under an earlier key while a newer one seals", () => {
    const newer = tokenKeyOf(randomBytes(32).toString("base64"), 2);
    const sealed = sealToken(key, library, "older");
    expect(openToken([newer, key], library, sealed)).toBe("older");
    expect(sealToken(newer, library, "newer").startsWith("v2.")).toBe(true);
  });

  it("accepts only 32-byte keys", () => {
    expect(() => tokenKeyOf(randomBytes(16).toString("base64"))).toThrow("32 bytes");
  });
});
