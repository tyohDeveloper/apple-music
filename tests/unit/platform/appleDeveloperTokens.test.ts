import { decodeProtectedHeader, exportPKCS8, generateKeyPair, jwtVerify } from "jose";
import { describe, expect, it } from "vitest";
import { developerTokensOf } from "../../../src/platform/appleDeveloperTokens.ts";

const { privateKey, publicKey } = await generateKeyPair("ES256", { extractable: true });
const credentials = { teamId: "TEAMID1234", keyId: "KEYID12345", privateKey: await exportPKCS8(privateKey) };
const start = Date.UTC(2026, 9, 19, 12);

describe("developer tokens", () => {
  it("signs ES256 tokens with the key id, the team as issuer and a 12-hour life", async () => {
    const tokens = await developerTokensOf(credentials, () => start);
    const { token, expiresAt } = await tokens.forServer();
    expect(decodeProtectedHeader(token)).toEqual({ alg: "ES256", kid: "KEYID12345" });
    const { payload } = await jwtVerify(token, publicKey, { issuer: "TEAMID1234", currentDate: new Date(start) });
    expect(payload.iat).toBe(start / 1000);
    expect(payload.exp).toBe(start / 1000 + 12 * 3600);
    expect(payload["origin"]).toBeUndefined();
    expect(expiresAt.getTime()).toBe(start + 12 * 3600 * 1000);
  });

  it("gives the browser a token for this application's origin", async () => {
    const tokens = await developerTokensOf(credentials, () => start);
    const { payload } = await jwtVerify((await tokens.forBrowser("https://music.example.test")).token, publicKey, { currentDate: new Date(start) });
    expect(payload["origin"]).toEqual(["https://music.example.test"]);
  });

  it("reuses a token until an hour before it expires", async () => {
    let now = start;
    const tokens = await developerTokensOf(credentials, () => now);
    const first = await tokens.forServer();
    now = start + 10 * 3600 * 1000;
    expect(await tokens.forServer()).toBe(first);
    now = start + 11 * 3600 * 1000 + 1;
    expect((await tokens.forServer()).token).not.toBe(first.token);
  });

  it("fails at once on a key that is not PKCS #8 P-256", async () => {
    await expect(developerTokensOf({ ...credentials, privateKey: "not a key" })).rejects.toThrow();
  });
});
