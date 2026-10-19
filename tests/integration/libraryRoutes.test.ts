// /api/libraries over HTTP with a real Better Auth session.
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { buildTestServer, createTestUser, openTestPools, testConfig } from "./support/testServices.ts";

let pools: DatabasePools;
let server: FastifyInstance;
let cookie: string;

beforeAll(async () => {
  pools = openTestPools();
  server = await buildTestServer(pools);
  const user = await createTestUser(pools, "routes");
  const signIn = await server.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: { origin: testConfig().publicOrigin },
    payload: { email: user.email, password: user.password },
  });
  expect(signIn.statusCode).toBe(200);
  cookie = [signIn.headers["set-cookie"]].flat().map((value) => String(value).split(";")[0]).join("; ");
});

afterAll(async () => {
  await server.close();
  await pools.close();
});

describe("/api/libraries", () => {
  it("requires a session", async () => {
    const response = await server.inject({ method: "GET", url: "/api/libraries" });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: { code: "unauthorized" } });
  });

  it("creates and lists libraries for the signed-in user", async () => {
    const headers = { cookie, origin: testConfig().publicOrigin };
    const created = await server.inject({ method: "POST", url: "/api/libraries", headers, payload: { label: "  Main   ID " } });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({ label: "Main ID", role: "owner", storefront: null });
    const listed = await server.inject({ method: "GET", url: "/api/libraries", headers });
    expect(listed.json().libraries.map((l: { label: string }) => l.label)).toEqual(["Main ID"]);
  });

  it("rejects a blank label", async () => {
    const headers = { cookie, origin: testConfig().publicOrigin };
    const response = await server.inject({ method: "POST", url: "/api/libraries", headers, payload: { label: "   " } });
    expect(response.statusCode).toBe(400);
  });
});
