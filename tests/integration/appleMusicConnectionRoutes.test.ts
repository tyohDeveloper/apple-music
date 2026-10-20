// Apple Music configuration, developer tokens and a library's connection (slice G), against
// the Apple Music fake: the owner connects with a token Apple accepts and it is stored sealed;
// a refused token is not stored; members read the state; only the owner connects or
// disconnects; a server without credentials says so.
import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { decodeJwt, decodeProtectedHeader } from "jose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { refusalOf } from "../../src/db/catalog/catalogRefusal.ts";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { withLibraryScope } from "../../src/db/withLibraryScope.ts";
import { fakeKeyId, fakeMusicUserToken, fakeTeamId, startAppleMusicFake, type AppleMusicFake } from "../support/appleMusicFake.ts";
import { signedInApi, type SignedInApi } from "./support/signedInApi.ts";
import { buildTestServer, openTestPools, queryAsRole, testConfig } from "./support/testServices.ts";

let pools: DatabasePools;
let fake: AppleMusicFake;
let server: FastifyInstance;
let bare: FastifyInstance;
let owner: SignedInApi;
let base: string;
let libraryId: string;

beforeAll(async () => {
  pools = openTestPools();
  fake = await startAppleMusicFake();
  const apple = { teamId: fakeTeamId, keyId: fakeKeyId, privateKey: fake.privateKeyPem };
  server = await buildTestServer(pools, { ...testConfig(), apple, tokenEncryptionKey: randomBytes(32).toString("base64"), appleMusicApiBaseUrl: fake.baseUrl });
  bare = await buildTestServer(pools, { ...testConfig(), apple: null });
  owner = await signedInApi(server, pools, "apple-owner");
  libraryId = (await owner.call("POST", "/api/libraries", { label: "Connected" })).body.id;
  base = `/api/libraries/${libraryId}/apple-music/connection`;
});

afterAll(async () => {
  await server.close();
  await bare.close();
  await fake.close();
  await pools.close();
});

async function member(role: "editor" | "viewer"): Promise<SignedInApi> {
  const api = await signedInApi(server, pools, `apple-${role}`);
  await queryAsRole(testConfig().database.adminUrl, "insert into library_member (library_id, user_id, role) values ($1, $2, $3)", [libraryId, api.userId, role]);
  return api;
}

describe("Apple Music connection", () => {
  it("says whether Apple Music is set up, and signs browser tokens for this origin", async () => {
    const unconfigured = await signedInApi(bare, pools, "apple-bare");
    expect((await unconfigured.call("GET", "/api/apple-music/configuration")).body).toEqual({ configured: false });
    expect(await unconfigured.call("GET", "/api/apple-music/developer-token")).toEqual({ status: 503, body: { error: { code: "apple-music-not-configured" } } });
    expect((await owner.call("GET", "/api/apple-music/configuration")).body).toEqual({ configured: true });
    const reply = await owner.get("/api/apple-music/developer-token");
    expect(reply.headers["cache-control"]).toBe("no-store");
    const { token } = reply.json();
    expect(decodeProtectedHeader(token)).toEqual({ alg: "ES256", kid: fakeKeyId });
    expect(decodeJwt(token)).toMatchObject({ iss: fakeTeamId, origin: [testConfig().publicOrigin] });
  });

  it("stores a token Apple accepts, sealed, with the storefront Apple reports", async () => {
    expect((await owner.call("GET", base)).body).toEqual({ status: "not-connected", storefront: null, connectedAt: null });
    const connected = await owner.call("PUT", base, { musicUserToken: fakeMusicUserToken });
    expect(connected.status).toBe(200);
    expect(connected.body).toMatchObject({ status: "connected", storefront: "us" });
    expect((await owner.call("GET", base)).body).toEqual(connected.body);
    const stored = await queryAsRole<{ sealed_token: string; storefront: string }>(testConfig().database.adminUrl,
      "select c.sealed_token, l.storefront from apple_music_connection c join library l on l.id = c.library_id where c.library_id = $1", [libraryId]);
    expect(stored.rows[0]?.storefront).toBe("us");
    expect(stored.rows[0]?.sealed_token).toMatch(/^v1\./u);
    expect(stored.rows[0]?.sealed_token).not.toContain(fakeMusicUserToken);
  });

  it("does not store a token Apple refuses, and reports Apple's own failures", async () => {
    const other = `/api/libraries/${(await owner.call("POST", "/api/libraries", { label: "Refused" })).body.id}/apple-music/connection`;
    expect(await owner.call("PUT", other, { musicUserToken: "not-accepted" })).toEqual({ status: 400, body: { error: { code: "apple-music-authorization-lost" } } });
    fake.failNext(401);
    expect(await owner.call("PUT", other, { musicUserToken: fakeMusicUserToken })).toEqual({ status: 502, body: { error: { code: "apple-music-developer-token-refused" } } });
    expect((await owner.call("GET", other)).body.status).toBe("not-connected");
  });

  it("lets members read the connection and only the owner change it", async () => {
    const editor = await member("editor");
    const viewer = await member("viewer");
    const stranger = await signedInApi(server, pools, "apple-stranger");
    expect(await editor.call("PUT", base, { musicUserToken: fakeMusicUserToken })).toEqual({ status: 403, body: { error: { code: "forbidden" } } });
    expect(await editor.call("DELETE", base)).toEqual({ status: 403, body: { error: { code: "forbidden" } } });
    expect((await viewer.call("GET", base)).body.status).toBe("connected");
    expect((await stranger.call("GET", base)).status).toBe(404);
    expect((await owner.call("DELETE", base)).status).toBe(204);
    expect((await viewer.call("GET", base)).body).toEqual({ status: "not-connected", storefront: null, connectedAt: null });
  });

  it("refuses an editor's write in the database as well", async () => {
    const editor = await member("editor");
    const insert = sql`insert into apple_music_connection (library_id, sealed_token, connected_by) values (${libraryId}, 'v1.a.b.c', ${editor.userId})`;
    const failure = await withLibraryScope(pools.app, { userId: editor.userId, libraryId }, (tx) => tx.execute(insert)).catch((error: unknown) => error);
    expect(refusalOf(failure, "not-found")?.code).toBe("forbidden");
  });
});
