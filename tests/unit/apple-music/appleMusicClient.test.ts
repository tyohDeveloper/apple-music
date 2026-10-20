import { afterEach, describe, expect, it, vi } from "vitest";
import { appleMusicClientOf } from "../../../src/apple-music/appleMusicClient.ts";
import { storefrontOf } from "../../../src/apple-music/storefrontOf.ts";

type Answer = Response | Error;

function answering(...answers: Answer[]) {
  const calls: Request[] = [];
  vi.stubGlobal("fetch", async (url: URL, init: RequestInit) => {
    calls.push(new Request(url, init));
    const answer = answers.shift();
    if (answer === undefined || answer instanceof Error) throw answer ?? new Error("no answer");
    return answer;
  });
  const waits: number[] = [];
  const client = appleMusicClientOf({ baseUrl: "https://api.example.test", developerToken: async () => "developer", sleep: async (ms) => void waits.push(ms) });
  return { client, calls, waits };
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers });

afterEach(() => vi.unstubAllGlobals());

describe("Apple Music client", () => {
  it("sends both tokens and reads the storefront", async () => {
    const { client, calls } = answering(json({ data: [{ id: "us", type: "storefronts" }] }));
    expect(await storefrontOf(client, "user-token")).toBe("us");
    expect(calls[0]?.url).toBe("https://api.example.test/v1/me/storefront");
    expect(calls[0]?.headers.get("authorization")).toBe("Bearer developer");
    expect(calls[0]?.headers.get("music-user-token")).toBe("user-token");
  });

  it("waits Retry-After after 429, at most 30 seconds, and backs off after 5xx or no answer", async () => {
    const { client, waits } = answering(json({}, 429, { "retry-after": "2" }), json({}, 503), new Error("reset"), json({ data: [] }));
    expect(await client.get({ path: "/v1/me/library/songs", musicUserToken: "user-token" })).toEqual({ data: [] });
    expect(waits).toEqual([2000, 2000, 4000]);
    const capped = answering(json({}, 429, { "retry-after": "120" }), json({ data: [] }));
    await capped.client.get({ path: "/v1/catalog/us/songs", musicUserToken: null });
    expect(capped.waits).toEqual([30000]);
  });

  it("gives up after three retries", async () => {
    const { client, calls } = answering(json({}, 500), json({}, 500), json({}, 500), json({}, 500));
    await expect(client.get({ path: "/v1/me/storefront", musicUserToken: "user-token" })).rejects.toMatchObject({ code: "apple-music-unavailable", status: 500 });
    expect(calls).toHaveLength(4);
  });

  it("names refused tokens without retrying", async () => {
    await expect(answering(json({}, 401)).client.get({ path: "/v1/me/storefront", musicUserToken: "t" })).rejects.toMatchObject({ code: "apple-music-developer-token-refused" });
    await expect(answering(json({}, 403)).client.get({ path: "/v1/me/storefront", musicUserToken: "t" })).rejects.toMatchObject({ code: "apple-music-authorization-lost" });
    await expect(answering(json({}, 400)).client.get({ path: "/v1/me/storefront", musicUserToken: "t" })).rejects.toMatchObject({ code: "apple-music-unexpected", status: 400 });
  });

  it("refuses a storefront answer without an id", async () => {
    await expect(storefrontOf(answering(json({ data: [] })).client, "t")).rejects.toMatchObject({ code: "apple-music-unexpected" });
  });
});
