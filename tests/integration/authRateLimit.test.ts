// Sign-in attempts are limited more strictly than the session checks every page load makes.
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

describe("auth rate limits", () => {
  it("allows many session checks but only twenty sign-in attempts a minute", async () => {
    const ip = "203.0.113.7";
    for (let attempt = 0; attempt < 30; attempt += 1) {
      expect((await server.inject({ method: "GET", url: "/api/auth/get-session", remoteAddress: ip })).statusCode).toBe(200);
    }
    const signIn = () => server.inject({ method: "POST", url: "/api/auth/sign-in/email", remoteAddress: ip, payload: { email: "nobody@example.test", password: "wrong-password-123" } });
    for (let attempt = 0; attempt < 20; attempt += 1) expect((await signIn()).statusCode).not.toBe(429);
    expect((await signIn()).statusCode).toBe(429);
  });
});
