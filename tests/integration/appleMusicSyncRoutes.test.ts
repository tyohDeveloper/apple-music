// Sync runs (slice H) against the Apple Music fake, with pages and catalog batches of two:
// a run pages every library list and looks up the catalog in batches; the next run records
// what changed and what Apple no longer lists; a listing that shares nothing with the mirror
// stops for confirmation and leaves the mirror as it was, until the owner replaces it; Apple's
// refusals fail a run; editors cancel; a shutdown interrupts; only one runs at a time.
import { randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SyncRun } from "../../src/contracts/apple-music/syncRunSchema.ts";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import type { ServerConfig } from "../../src/server/config/readServerConfig.ts";
import { fakeKeyId, fakeMusicUserToken, fakeTeamId, startAppleMusicFake, type AppleMusicFake } from "../support/appleMusicFake.ts";
import { fixtureLibrary, type FakeItem, type FakeLibrary } from "../support/appleMusicFixture.ts";
import { signedInApi, type SignedInApi } from "./support/signedInApi.ts";
import { buildTestServer, openTestPools, queryAsRole, testConfig } from "./support/testServices.ts";

let pools: DatabasePools;
let fake: AppleMusicFake;
let config: ServerConfig;
let server: FastifyInstance;
let owner: SignedInApi;
let editor: SignedInApi;
let viewer: SignedInApi;
let libraryId: string;
let runs: string;

const adminUrl = () => testConfig().database.adminUrl;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function member(role: "editor" | "viewer"): Promise<SignedInApi> {
  const api = await signedInApi(server, pools, `sync-${role}`);
  await queryAsRole(adminUrl(), "insert into library_member (library_id, user_id, role) values ($1, $2, $3)", [libraryId, api.userId, role]);
  return api;
}

async function finishedRun(): Promise<SyncRun> {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const { body } = await owner.call("GET", `${runs}/latest`);
    if (body.run !== null && body.run.status !== "running") return body.run;
    await pause(25);
  }
  throw new Error("the sync run did not finish");
}

async function syncedRun(api: SignedInApi = owner, replaceMirror = false): Promise<SyncRun> {
  const started = await api.call("POST", runs, { replaceMirror });
  expect(started.status).toBe(202);
  return finishedRun();
}

async function mirrorCount(table: "apple_library_item" | "apple_catalog_item", extra = "true"): Promise<number> {
  const rows = await queryAsRole<{ count: number }>(adminUrl(), `select count(*)::int as count from ${table} where library_id = $1 and ${extra}`, [libraryId]);
  return rows.rows[0]?.count ?? 0;
}

const renamed = (item: FakeItem, name: string): FakeItem => ({ ...item, attributes: { ...item.attributes, name } });
const otherAccount = (items: readonly FakeItem[]) => items.map((item) => ({ ...item, id: item.id.replace("fake", "other") }));

beforeAll(async () => {
  pools = openTestPools();
  fake = await startAppleMusicFake();
  const apple = { teamId: fakeTeamId, keyId: fakeKeyId, privateKey: fake.privateKeyPem };
  const sync = { pageSize: 2, catalogSongBatch: 2, catalogAlbumBatch: 2, startsPerMinute: 100 };
  config = { ...testConfig(), apple, tokenEncryptionKey: randomBytes(32).toString("base64"), appleMusicApiBaseUrl: fake.baseUrl, sync };
  server = await buildTestServer(pools, config);
  owner = await signedInApi(server, pools, "sync-owner");
  libraryId = (await owner.call("POST", "/api/libraries", { label: "Synced" })).body.id;
  runs = `/api/libraries/${libraryId}/apple-music/sync-runs`;
  editor = await member("editor");
  viewer = await member("viewer");
});

afterAll(async () => {
  await server.close();
  await fake.close();
  await pools.close();
});

describe("sync runs", () => {
  it("need a connected library", async () => {
    expect(await owner.call("GET", `${runs}/latest`)).toEqual({ status: 200, body: { run: null } });
    expect(await owner.call("POST", runs, { replaceMirror: false })).toEqual({ status: 409, body: { error: { code: "apple-music-not-connected" } } });
    expect((await owner.call("PUT", `/api/libraries/${libraryId}/apple-music/connection`, { musicUserToken: fakeMusicUserToken })).status).toBe(200);
  });

  it("page every library list and look up the catalog in batches", async () => {
    fake.requests.length = 0;
    const run = await syncedRun();
    expect(run).toMatchObject({ status: "succeeded", phase: "removals", errorCode: null, replaceMirror: false });
    expect(run.counts).toEqual({ songs: 5, albums: 4, artists: 3, playlists: 1, catalogSongs: 4, catalogAlbums: 3, added: 13, changed: 0, removed: 0 });
    const songPages = fake.requests.filter((url) => url.startsWith("/v1/me/library/songs"));
    expect(songPages).toEqual([0, 2, 4].map((offset) => `/v1/me/library/songs?limit=2&include=albums,artists,catalog&offset=${offset}`));
    expect(fake.requests.filter((url) => url.startsWith("/v1/catalog/us/songs"))).toEqual(["/v1/catalog/us/songs?ids=9100000001,9100000002", "/v1/catalog/us/songs?ids=9100000003,9100000004"]);
    expect(fake.requests.filter((url) => url.startsWith("/v1/catalog/us/albums"))).toHaveLength(2);
    expect(await mirrorCount("apple_library_item")).toBe(13);
    expect(await mirrorCount("apple_catalog_item")).toBe(7);
    expect(await mirrorCount("apple_library_item", "apple_id = 'i.fakeSong05' and catalog_id is null")).toBe(1);
  });

  it("record what changed and what Apple no longer lists", async () => {
    const [first, second, third, fourth] = fixtureLibrary.songs as [FakeItem, FakeItem, FakeItem, FakeItem, FakeItem];
    const added: FakeItem = { ...first, id: "i.fakeSong06", attributes: { ...first.attributes, name: "Lighthouse" } };
    fake.useLibrary({ ...fixtureLibrary, songs: [first, renamed(second, "Low Tide (Remastered)"), third, fourth, added] });
    const run = await syncedRun(editor);
    expect(run.counts).toMatchObject({ songs: 5, added: 1, changed: 1, removed: 1 });
    expect(await mirrorCount("apple_library_item", "removed_run_id is null")).toBe(13);
    expect(await mirrorCount("apple_library_item", `apple_id = 'i.fakeSong05' and removed_run_id = '${run.id}'`)).toBe(1);
  });

  it("stop for confirmation when the listing shares nothing with the mirror, leaving the mirror as it was", async () => {
    const other: FakeLibrary = { ...fixtureLibrary, songs: otherAccount(fixtureLibrary.songs), albums: otherAccount(fixtureLibrary.albums), artists: otherAccount(fixtureLibrary.artists), playlists: otherAccount(fixtureLibrary.playlists) };
    fake.useLibrary(other);
    const run = await syncedRun();
    expect(run).toMatchObject({ status: "needs-confirmation", errorCode: null });
    expect(run.counts).toMatchObject({ songs: 5, added: 0, changed: 0, removed: 0, catalogSongs: 0 });
    expect(await mirrorCount("apple_library_item")).toBe(14);
    expect(await mirrorCount("apple_library_item", "apple_id like '%other%'")).toBe(0);
  });

  it("replace the mirror only when the owner asks", async () => {
    expect((await editor.call("POST", runs, { replaceMirror: true })).status).toBe(403);
    const run = await syncedRun(owner, true);
    expect(run).toMatchObject({ status: "succeeded", replaceMirror: true });
    expect(run.counts).toMatchObject({ added: 13, removed: 13 });
    expect(await mirrorCount("apple_library_item", "removed_run_id is null and apple_id like '%other%'")).toBe(13);
    fake.useLibrary(fixtureLibrary);
  });

  it("fail when Apple refuses the Music User Token, and retry a limited request", async () => {
    fake.failNext(403);
    expect(await syncedRun()).toMatchObject({ status: "failed", errorCode: "apple-music-authorization-lost" });
    fake.failNext(429, 1, { "retry-after": "1" });
    expect(await syncedRun()).toMatchObject({ status: "succeeded" });
  });

  it("run one at a time, and editors cancel a running one", async () => {
    const held = fake.holdNext();
    expect((await editor.call("POST", runs, { replaceMirror: false })).status).toBe(202);
    await held.reached;
    expect(await owner.call("POST", runs, { replaceMirror: false })).toEqual({ status: 409, body: { error: { code: "sync-already-running" } } });
    const running = (await viewer.call("GET", `${runs}/latest`)).body.run;
    expect(running).toMatchObject({ status: "running", phase: "songs" });
    expect((await viewer.call("POST", `${runs}/${running.id}/cancel`)).status).toBe(403);
    expect((await editor.call("POST", `${runs}/${running.id}/cancel`)).status).toBe(204);
    held.release();
    expect(await finishedRun()).toMatchObject({ id: running.id, status: "cancelled" });
    expect(await editor.call("POST", `${runs}/${running.id}/cancel`)).toEqual({ status: 409, body: { error: { code: "sync-not-running" } } });
  });

  it("let viewers read runs but not start them", async () => {
    expect((await viewer.call("GET", `${runs}/latest`)).status).toBe(200);
    expect((await viewer.call("POST", runs, { replaceMirror: false })).status).toBe(403);
  });

  it("count finished runs by status", async () => {
    const metrics = await server.inject({ method: "GET", url: "/metrics" });
    expect(metrics.body).toContain('apple_music_sync_runs_total{status="succeeded"} 4');
    expect(metrics.body).toContain('apple_music_sync_runs_total{status="needs-confirmation"} 1');
    expect(metrics.body).toContain('apple_music_sync_runs_total{status="cancelled"} 1');
  });

  it("are interrupted when the server shuts down", async () => {
    const other = await buildTestServer(pools, config);
    const api = await signedInApi(other, pools, "sync-shutdown");
    const ownLibrary = (await api.call("POST", "/api/libraries", { label: "Shut down" })).body.id;
    await api.call("PUT", `/api/libraries/${ownLibrary}/apple-music/connection`, { musicUserToken: fakeMusicUserToken });
    const held = fake.holdNext();
    expect((await api.call("POST", `/api/libraries/${ownLibrary}/apple-music/sync-runs`, { replaceMirror: false })).status).toBe(202);
    await held.reached;
    const closing = other.close();
    held.release();
    await closing;
    const rows = await queryAsRole<{ status: string }>(adminUrl(), "select status from sync_run where library_id = $1", [ownLibrary]);
    expect(rows.rows).toEqual([{ status: "interrupted" }]);
  });
});
