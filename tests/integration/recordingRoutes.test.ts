// /api/libraries/{libraryId}/recordings: recordings and their credits (slice B).
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { signedInApi, type SignedInApi } from "./support/signedInApi.ts";
import { buildTestServer, openTestPools, queryAsRole, testConfig } from "./support/testServices.ts";

let pools: DatabasePools;
let server: FastifyInstance;
let owner: SignedInApi;
let library: string;
let recordings: string;
let performers: string;

beforeAll(async () => {
  pools = openTestPools();
  server = await buildTestServer(pools);
  owner = await signedInApi(server, pools, "recording-owner");
  library = (await owner.call("POST", "/api/libraries", { label: "Recording tests" })).body.id;
  recordings = `/api/libraries/${library}/recordings`;
  performers = `/api/libraries/${library}/performers`;
});

afterAll(async () => {
  await server.close();
  await pools.close();
});

async function created(path: string, payload: object) {
  const reply = await owner.call("POST", path, payload);
  expect(reply.status).toBe(201);
  return reply.body;
}

describe("recordings", () => {
  it("creates, edits and clears a recording's fields", async () => {
    const take = await created(recordings, { title: "So  What", kind: "studio", recordedFrom: "1959-03-02", durationMs: 562000, venue: "Columbia 30th Street Studio" });
    expect(take).toMatchObject({ title: "So What", kind: "studio", recordedFrom: "1959-03-02", durationMs: 562000, credits: [], creditLine: "" });
    const edited = await owner.call("PATCH", `${recordings}/${take.id}`, { versionNote: "alternate take", kind: "alternate-take", venue: null });
    expect(edited.body).toMatchObject({ versionNote: "alternate take", kind: "alternate-take", venue: null, durationMs: 562000 });
    expect((await owner.call("PATCH", `${recordings}/${take.id}`, { durationMs: -1 })).status).toBe(400);
    expect((await owner.call("POST", recordings, { title: "Bad kind", kind: "bootleg" })).status).toBe(400);
  });

  it("replaces the ordered credits and builds the credit line from performing roles", async () => {
    const simon = await created(performers, { kind: "person", name: "Paul Simon" });
    const garfunkel = await created(performers, { kind: "person", name: "Art Garfunkel" });
    const artie = (await owner.call("POST", `${performers}/${garfunkel.id}/names`, { name: "Artie Garfunkel", kind: "alias" })).body.names.find((n: { name: string }) => n.name === "Artie Garfunkel");
    const song = await created(recordings, { title: "The Boxer", kind: "studio" });
    const credits = [
      { performerId: simon.id, role: "primary", joinPhrase: " & " },
      { performerId: garfunkel.id, role: "primary", creditedNameId: artie.id },
      { performerId: simon.id, role: "composer", instruments: ["guitar"] },
    ];
    const replaced = await owner.call("PUT", `${recordings}/${song.id}/credits`, { credits });
    expect(replaced.status).toBe(200);
    expect(replaced.body.creditLine).toBe("Paul Simon & Artie Garfunkel");
    expect(replaced.body.credits.map((c: { role: string }) => c.role)).toEqual(["primary", "primary", "composer"]);
    expect(replaced.body.credits[1]).toMatchObject({ performer: { id: garfunkel.id, name: "Art Garfunkel" }, creditedName: { id: artie.id, name: "Artie Garfunkel" } });
    expect(replaced.body.credits[1].performerNames.map((n: { name: string }) => n.name)).toEqual(["Art Garfunkel", "Artie Garfunkel"]);
    expect(replaced.body.credits[2]).toMatchObject({ creditedName: null, joinPhrase: null, instruments: ["guitar"] });
    const reordered = await owner.call("PUT", `${recordings}/${song.id}/credits`, { credits: [credits[1], { ...credits[0], joinPhrase: null }] });
    expect(reordered.body.creditLine).toBe("Artie Garfunkel, Paul Simon");
    expect((await owner.call("GET", `${recordings}?query=artie`)).body.items).toEqual([expect.objectContaining({ id: song.id, creditLine: "Artie Garfunkel, Paul Simon" })]);
    expect((await owner.call("GET", `${recordings}?performerId=${simon.id}`)).body.total).toBe(1);
  });

  it("refuses credits naming a performer or name that does not fit", async () => {
    const song = await created(recordings, { title: "Mrs. Robinson", kind: "studio" });
    const simon = await created(performers, { kind: "person", name: "Paul Frederic Simon" });
    const other = await created(performers, { kind: "person", name: "Someone Else" });
    const missing = { credits: [{ performerId: "00000000-0000-4000-8000-000000000000", role: "primary" }] };
    expect((await owner.call("PUT", `${recordings}/${song.id}/credits`, missing)).status).toBe(404);
    const wrongName = { credits: [{ performerId: simon.id, role: "primary", creditedNameId: other.names[0].id }] };
    expect((await owner.call("PUT", `${recordings}/${song.id}/credits`, wrongName)).status).toBe(404);
    expect((await owner.call("PUT", `${recordings}/${song.id}/credits`, { credits: [{ performerId: simon.id, role: "drummer" }] })).status).toBe(400);
    expect((await owner.call("GET", `${recordings}/${song.id}`)).body.credits).toEqual([]);
  });

  it("refuses to delete a credited performer or credited name, then deletes the recording with its credits", async () => {
    const cash = await created(performers, { kind: "person", name: "Johnny Cash" });
    const named = await owner.call("POST", `${performers}/${cash.id}/names`, { name: "John R. Cash", kind: "spelling-variant" });
    const legal = named.body.names.find((n: { name: string }) => n.name === "John R. Cash");
    const song = await created(recordings, { title: "Folsom Prison Blues", kind: "live" });
    await owner.call("PUT", `${recordings}/${song.id}/credits`, { credits: [{ performerId: cash.id, role: "primary", creditedNameId: legal.id }] });
    expect((await owner.call("DELETE", `${performers}/${cash.id}`))).toEqual({ status: 409, body: { error: { code: "conflict-in-use" } } });
    expect((await owner.call("DELETE", `${performers}/${cash.id}/names/${legal.id}`)).status).toBe(409);
    expect((await owner.call("DELETE", `${recordings}/${song.id}`)).status).toBe(204);
    expect((await owner.call("GET", `${recordings}/${song.id}`)).status).toBe(404);
    expect((await owner.call("DELETE", `${performers}/${cash.id}`)).status).toBe(204);
  });

  it("keeps recordings to their library and their editors", async () => {
    const song = await created(recordings, { title: "Hurt", kind: "studio" });
    const viewer = await signedInApi(server, pools, "recording-viewer");
    const grant = "insert into library_member (library_id, user_id, role) values ($1, $2, 'viewer')";
    await queryAsRole(testConfig().database.adminUrl, grant, [library, viewer.userId]);
    expect((await viewer.call("GET", `${recordings}/${song.id}`)).body.title).toBe("Hurt");
    expect((await viewer.call("PATCH", `${recordings}/${song.id}`, { title: "Changed" })).status).toBe(403);
    expect((await viewer.call("PUT", `${recordings}/${song.id}/credits`, { credits: [] })).status).toBe(403);
    const stranger = await signedInApi(server, pools, "recording-stranger");
    expect((await stranger.call("GET", `${recordings}/${song.id}`)).status).toBe(404);
    expect((await stranger.call("DELETE", `${recordings}/${song.id}`)).status).toBe(403);
  });
});
