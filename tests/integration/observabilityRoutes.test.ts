import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { buildTestServer, openTestPools } from "./support/testServices.ts";

let pools: DatabasePools;
let server: FastifyInstance;

beforeAll(async () => {
  pools = openTestPools();
  server = await buildTestServer(pools);
});

afterAll(async () => {
  await server.close();
  await pools.close();
});

describe("observability", () => {
  it("reports health when the database answers", async () => {
    const response = await server.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("counts responses by status class", async () => {
    await server.inject({ method: "GET", url: "/api/libraries" });
    const metrics = await server.inject({ method: "GET", url: "/metrics" });
    expect(metrics.body).toMatch(/http_responses_total\{class="4xx"\} \d+/);
  });

  it("sends a Content-Security-Policy", async () => {
    const response = await server.inject({ method: "GET", url: "/health" });
    expect(response.headers["content-security-policy"]).toContain("script-src 'self' https://js-cdn.music.apple.com");
  });
});
