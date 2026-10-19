// /api/libraries/{libraryId}/performers: performers, names and relations (slice A).
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { signedInApi, type SignedInApi } from "./support/signedInApi.ts";
import { buildTestServer, openTestPools, queryAsRole, testConfig } from "./support/testServices.ts";

let pools: DatabasePools;
let server: FastifyInstance;
let owner: SignedInApi;
let stranger: SignedInApi;
let base: string;

beforeAll(async () => {
  pools = openTestPools();
  server = await buildTestServer(pools);
  owner = await signedInApi(server, pools, "performer-owner");
  stranger = await signedInApi(server, pools, "performer-stranger");
  const library = await owner.call("POST", "/api/libraries", { label: "Performer tests" });
  base = `/api/libraries/${library.body.id}/performers`;
});

afterAll(async () => {
  await server.close();
  await pools.close();
});

async function createPerformer(payload: object) {
  const created = await owner.call("POST", base, payload);
  expect(created.status).toBe(201);
  return created.body;
}

describe("performers", () => {
  it("creates a performer under its preferred name and finds it by any name", async () => {
    const beatles = await createPerformer({ kind: "group", name: "The  Beatles", sortName: "Beatles, The", area: "Liverpool" });
    expect(beatles).toMatchObject({ kind: "group", area: "Liverpool", relations: [] });
    expect(beatles.names).toEqual([expect.objectContaining({ name: "The Beatles", sortName: "Beatles, The", kind: "primary", isPreferred: true })]);
    const lennon = await createPerformer({ kind: "person", name: "John Lennon", began: "1940-10-09", ended: "1980-12-08" });
    const named = await owner.call("POST", `${base}/${lennon.id}/names`, { name: "John Winston Lennon", kind: "birth" });
    expect(named.status).toBe(201);
    expect((await owner.call("GET", `${base}?query=winston`)).body.items.map((p: { id: string }) => p.id)).toEqual([lennon.id]);
    expect((await owner.call("GET", `${base}?query=BEATLES`)).body).toMatchObject({ total: 1, items: [{ name: "The Beatles" }] });
  });

  it("orders by sort name and pages from offset 0", async () => {
    const page = await owner.call("GET", `${base}?limit=1&offset=0`);
    expect(page.body.total).toBeGreaterThanOrEqual(2);
    expect(page.body.items).toHaveLength(1);
    expect(page.body.items[0].sortName).toBe("Beatles, The");
  });

  it("moves the preferred name and refuses to remove it", async () => {
    const person = await createPerformer({ kind: "person", name: "Prince" });
    const added = await owner.call("POST", `${base}/${person.id}/names`, { name: "Prince Rogers Nelson", kind: "birth", isPreferred: true });
    const preferred = added.body.names.filter((name: { isPreferred: boolean }) => name.isPreferred);
    expect(preferred.map((name: { name: string }) => name.name)).toEqual(["Prince Rogers Nelson"]);
    const removal = await owner.call("DELETE", `${base}/${person.id}/names/${preferred[0].id}`);
    expect(removal).toEqual({ status: 409, body: { error: { code: "conflict-preferred-name" } } });
    const other = added.body.names.find((name: { isPreferred: boolean }) => !name.isPreferred);
    const back = await owner.call("PATCH", `${base}/${person.id}/names/${other.id}`, { isPreferred: true });
    expect(back.body.names[0]).toMatchObject({ name: "Prince", isPreferred: true });
    expect((await owner.call("DELETE", `${base}/${person.id}/names/${preferred[0].id}`)).body.names).toHaveLength(1);
  });

  it("relates performers and shows the relation from both sides", async () => {
    const band = await createPerformer({ kind: "group", name: "Wings" });
    const member = await createPerformer({ kind: "person", name: "Linda McCartney" });
    const related = await owner.call("POST", `${base}/${member.id}/relations`, { kind: "member-of", objectId: band.id, roles: ["keyboards"] });
    expect(related.status).toBe(201);
    const fromBand = (await owner.call("GET", `${base}/${band.id}`)).body;
    expect(fromBand.relations).toEqual([expect.objectContaining({ kind: "member-of", roles: ["keyboards"], subject: { id: member.id, name: "Linda McCartney" }, object: { id: band.id, name: "Wings" } })]);
    expect((await owner.call("POST", `${base}/${band.id}/relations`, { kind: "member-of", objectId: band.id })).status).toBe(400);
    const missing = await owner.call("POST", `${base}/${band.id}/relations`, { kind: "member-of", objectId: "00000000-0000-4000-8000-000000000000" });
    expect(missing.status).toBe(404);
    expect((await owner.call("DELETE", `${base}/${member.id}`)).status).toBe(204);
    expect((await owner.call("GET", `${base}/${band.id}`)).body.relations).toEqual([]);
  });

  it("edits and clears fields, and validates kinds and partial dates", async () => {
    const performer = await createPerformer({ kind: "orchestra", name: "London Symphony Orchestra", area: "London" });
    expect((await owner.call("PATCH", `${base}/${performer.id}`, { area: null, began: "1904-06" })).body).toMatchObject({ area: null, began: "1904-06" });
    expect((await owner.call("PATCH", `${base}/${performer.id}`, { began: "1904-02-30" })).status).toBe(400);
    expect((await owner.call("PATCH", `${base}/${performer.id}`, { kind: "string-quartet" })).status).toBe(400);
    expect((await owner.call("PATCH", `${base}/${performer.id}`, {})).status).toBe(400);
    expect((await owner.call("GET", `${base}/00000000-0000-4000-8000-000000000000`)).status).toBe(404);
  });
});

describe("performer access", () => {
  it("hides performers from non-members and refuses their writes", async () => {
    const performer = await createPerformer({ kind: "person", name: "Nina Simone" });
    expect((await stranger.call("GET", `${base}/${performer.id}`)).status).toBe(404);
    expect((await stranger.call("GET", base)).body).toEqual({ items: [], total: 0 });
    expect((await stranger.call("POST", base, { kind: "person", name: "Intruder" })).status).toBe(403);
    expect((await stranger.call("PATCH", `${base}/${performer.id}`, { area: "Elsewhere" })).status).toBe(403);
    expect((await stranger.call("DELETE", `${base}/${performer.id}`)).status).toBe(403);
  });

  it("lets a viewer read but not write", async () => {
    const viewer = await signedInApi(server, pools, "performer-viewer");
    const libraryId = base.split("/")[3];
    const grant = "insert into library_member (library_id, user_id, role) values ($1, $2, 'viewer')";
    await queryAsRole(testConfig().database.adminUrl, grant, [libraryId, viewer.userId]);
    expect((await viewer.call("GET", base)).body.total).toBeGreaterThan(0);
    expect((await viewer.call("POST", base, { kind: "person", name: "Viewer write" })).status).toBe(403);
    const performer = await createPerformer({ kind: "person", name: "Odetta" });
    expect((await viewer.call("PATCH", `${base}/${performer.id}`, { area: "Birmingham" })).status).toBe(403);
    expect((await viewer.call("POST", `${base}/${performer.id}/names`, { name: "Odetta Holmes", kind: "birth" })).status).toBe(403);
    expect((await viewer.call("DELETE", `${base}/${performer.id}`)).status).toBe(403);
    expect((await viewer.call("GET", `${base}/${performer.id}`)).body.area).toBeNull();
  });
});
