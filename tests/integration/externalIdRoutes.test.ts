// PUT .../external-ids on performers, albums, editions and recordings (slice E): values are
// normalized, checked against their namespace's form for the kind of entity, stored once,
// read back in namespace order, and deleted with their entity.
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { signedInApi, type SignedInApi } from "./support/signedInApi.ts";
import { buildTestServer, openTestPools, queryAsRole, testConfig } from "./support/testServices.ts";

let pools: DatabasePools;
let server: FastifyInstance;
let owner: SignedInApi;
let base: string;

beforeAll(async () => {
  pools = openTestPools();
  server = await buildTestServer(pools);
  owner = await signedInApi(server, pools, "identifier-owner");
  base = `/api/libraries/${(await owner.call("POST", "/api/libraries", { label: "Identifier tests" })).body.id}`;
});

afterAll(async () => {
  await server.close();
  await pools.close();
});

async function created(path: string, payload: object) {
  const reply = await owner.call("POST", `${base}${path}`, payload);
  expect(reply.status).toBe(201);
  return reply.body;
}

const mbid = "561D854A-6A28-4AA7-8C99-323E6CE46C2A";

describe("external identifiers", () => {
  it("normalizes a recording's identifiers, keeps each once and reads them in namespace order", async () => {
    const recording = await created("/recordings", { title: "So What", kind: "studio" });
    const externalIds = [
      { namespace: "isrc", value: " us-sm1-59-00113 " },
      { namespace: "apple-catalog", value: "1440857781" },
      { namespace: "isrc", value: "USSM15900113" },
      { namespace: "musicbrainz", value: mbid },
    ];
    const reply = await owner.call("PUT", `${base}/recordings/${recording.id}/external-ids`, { externalIds });
    expect(reply.status).toBe(200);
    expect(reply.body.externalIds).toEqual([
      { namespace: "apple-catalog", value: "1440857781" },
      { namespace: "isrc", value: "USSM15900113" },
      { namespace: "musicbrainz", value: mbid.toLowerCase() },
    ]);
    expect((await owner.call("GET", `${base}/recordings/${recording.id}`)).body.externalIds).toHaveLength(3);
    expect((await owner.call("PUT", `${base}/recordings/${recording.id}/external-ids`, { externalIds: [] })).body.externalIds).toEqual([]);
  });

  it("refuses values without their form, and namespaces the entity does not take", async () => {
    const album = await created("/albums", { title: "Kind of Blue", kind: "album" });
    const put = (namespace: string, value: string) => owner.call("PUT", `${base}/albums/${album.id}/external-ids`, { externalIds: [{ namespace, value }] });
    expect((await put("discogs", "5460")).status).toBe(200);
    expect((await put("discogs", "05460")).body).toEqual({ error: { code: "invalid-external-id" } });
    expect((await put("isrc", "USSM15900113")).body).toEqual({ error: { code: "invalid-external-id" } });
    expect((await put("unknown", "1")).body).toEqual({ error: { code: "validation" } });
    expect((await owner.call("GET", `${base}/albums/${album.id}`)).body.externalIds).toEqual([{ namespace: "discogs", value: "5460" }]);
  });

  it("stores identifiers on performers and editions and deletes them with their entity", async () => {
    const performer = await created("/performers", { kind: "person", name: "Miles Davis" });
    const album = await created("/albums", { title: "Sketches of Spain", kind: "album" });
    const edition = await created(`/albums/${album.id}/editions`, { title: "Sketches of Spain", kind: "original" });
    const wikidata = await owner.call("PUT", `${base}/performers/${performer.id}/external-ids`, { externalIds: [{ namespace: "wikidata", value: "q93341" }] });
    expect(wikidata.body.externalIds).toEqual([{ namespace: "wikidata", value: "Q93341" }]);
    const upc = await owner.call("PUT", `${base}/editions/${edition.id}/external-ids`, { externalIds: [{ namespace: "upc", value: "0 74646 52222 7" }] });
    expect(upc.body.externalIds).toEqual([{ namespace: "upc", value: "074646522227" }]);
    expect((await owner.call("PUT", `${base}/editions/${crypto.randomUUID()}/external-ids`, { externalIds: [] })).status).toBe(404);
    expect((await owner.call("DELETE", `${base}/editions/${edition.id}`)).status).toBe(204);
    expect((await owner.call("DELETE", `${base}/performers/${performer.id}`)).status).toBe(204);
    const counting = "select (select count(*) from edition_external_id where edition_id = $1) + (select count(*) from performer_external_id where performer_id = $2) as n";
    const left = await queryAsRole<{ n: string }>(testConfig().database.adminUrl, counting, [edition.id, performer.id]);
    expect(Number(left.rows[0]?.n)).toBe(0);
  });
});
