// /api/libraries/{libraryId}/albums and /editions: albums, their credits and intended track
// lists, and their editions with track inclusion (slice C).
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
  owner = await signedInApi(server, pools, "album-owner");
  const library = (await owner.call("POST", "/api/libraries", { label: "Album tests" })).body.id;
  base = `/api/libraries/${library}`;
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

async function soloistAlbum() {
  const soloist = await created("/performers", { kind: "person", name: "Itzhak Perlman" });
  const london = await created("/performers", { kind: "orchestra", name: "London Symphony Orchestra" });
  const chicago = await created("/performers", { kind: "orchestra", name: "Chicago Symphony Orchestra" });
  const first = await created("/recordings", { title: "Violin Concerto: I. Allegro", kind: "studio" });
  const second = await created("/recordings", { title: "Violin Concerto: II. Adagio", kind: "studio" });
  await owner.call("PUT", `${base}/recordings/${first.id}/credits`, { credits: [{ performerId: soloist.id, role: "soloist" }, { performerId: london.id, role: "orchestra" }] });
  await owner.call("PUT", `${base}/recordings/${second.id}/credits`, { credits: [{ performerId: soloist.id, role: "soloist" }, { performerId: chicago.id, role: "orchestra" }] });
  const album = await created("/albums", { title: "Concertos", kind: "album", released: "1980" });
  return { soloist, chicago, first, second, album };
}

describe("albums", () => {
  it("keeps one album whose tracks credit different orchestras, with its own credits and track list", async () => {
    const { soloist, chicago, first, second, album } = await soloistAlbum();
    await owner.call("PUT", `${base}/albums/${album.id}/credits`, { credits: [{ performerId: soloist.id, role: "soloist" }] });
    const tracks = { discs: [{ tracks: [{ recordingId: first.id, label: "A1" }, { recordingId: second.id, title: "Adagio" }] }] };
    const replaced = await owner.call("PUT", `${base}/albums/${album.id}/tracks`, tracks);
    expect(replaced.status).toBe(200);
    expect(replaced.body.creditLine).toBe("Itzhak Perlman");
    expect(replaced.body.tracks.map((t: { discIndex: number; position: number; label: string | null }) => [t.discIndex, t.position, t.label])).toEqual([[0, 0, "A1"], [0, 1, null]]);
    expect(replaced.body.tracks[1].recording).toMatchObject({ id: second.id, creditLine: "Itzhak Perlman, Chicago Symphony Orchestra" });
    const listed = (await owner.call("GET", `${base}/albums?query=chicago`)).body;
    expect(listed.items).toEqual([expect.objectContaining({ id: album.id, trackCount: 2, editionCount: 0 })]);
    expect((await owner.call("GET", `${base}/albums?performerId=${chicago.id}`)).body.total).toBe(1);
    expect((await owner.call("GET", `${base}/albums?recordingId=${first.id}`)).body.total).toBe(1);
    expect((await owner.call("DELETE", `${base}/recordings/${first.id}`)).status).toBe(409);
  });

  it("refuses track lists naming missing recordings or empty discs", async () => {
    const album = await created("/albums", { title: "Empty", kind: "ep" });
    const missing = { discs: [{ tracks: [{ recordingId: "00000000-0000-4000-8000-000000000000" }] }] };
    expect((await owner.call("PUT", `${base}/albums/${album.id}/tracks`, missing)).status).toBe(404);
    expect((await owner.call("PUT", `${base}/albums/${album.id}/tracks`, { discs: [{ tracks: [] }] })).status).toBe(400);
    expect((await owner.call("PATCH", `${base}/albums/${album.id}`, { kind: "mixtape" })).status).toBe(400);
  });

  it("issues editions with classified tracks, moves one to another album, and guards deletion", async () => {
    const { first, second, album } = await soloistAlbum();
    const deluxe = await created(`/albums/${album.id}/editions`, { title: "Concertos (Deluxe)", kind: "deluxe", released: "2005-03" });
    expect(deluxe).toMatchObject({ album: { id: album.id, title: "Concertos" }, kind: "deluxe", tracks: [] });
    const tracks = { discs: [{ tracks: [{ title: "Allegro", recordingId: first.id, inclusion: "core" }] }, { tracks: [{ title: "Interview", inclusion: "interview" }, { title: "Adagio (rehearsal)", recordingId: second.id, inclusion: "alternate" }] }] };
    const replaced = (await owner.call("PUT", `${base}/editions/${deluxe.id}/tracks`, tracks)).body;
    expect(replaced.tracks.map((t: { discIndex: number; position: number; inclusion: string }) => [t.discIndex, t.position, t.inclusion])).toEqual([[0, 0, "core"], [1, 0, "interview"], [1, 1, "alternate"]]);
    expect(replaced.tracks[1].recording).toBeNull();
    expect((await owner.call("GET", `${base}/albums/${album.id}`)).body.editions).toEqual([expect.objectContaining({ id: deluxe.id, trackCount: 3 })]);
    expect((await owner.call("GET", `${base}/albums?query=concertos`)).body.items).toContainEqual(expect.objectContaining({ id: album.id, editionCount: 1 }));
    expect((await owner.call("DELETE", `${base}/albums/${album.id}`))).toEqual({ status: 409, body: { error: { code: "conflict-in-use" } } });
    expect((await owner.call("DELETE", `${base}/recordings/${second.id}`)).status).toBe(409);
    const other = await created("/albums", { title: "Concertos, volume 2", kind: "album" });
    expect((await owner.call("PATCH", `${base}/editions/${deluxe.id}`, { albumId: other.id })).body.album.id).toBe(other.id);
    expect((await owner.call("PATCH", `${base}/editions/${deluxe.id}`, { albumId: "00000000-0000-4000-8000-000000000000" })).status).toBe(404);
    expect((await owner.call("DELETE", `${base}/albums/${album.id}`)).status).toBe(204);
    expect((await owner.call("DELETE", `${base}/editions/${deluxe.id}`)).status).toBe(204);
    expect((await owner.call("GET", `${base}/editions/${deluxe.id}`)).status).toBe(404);
  });

  it("keeps albums and editions to their library and their editors", async () => {
    const album = await created("/albums", { title: "Private", kind: "album" });
    const edition = await created(`/albums/${album.id}/editions`, { title: "Private", kind: "original" });
    const viewer = await signedInApi(server, pools, "album-viewer");
    const grant = "insert into library_member (library_id, user_id, role) values ($1, $2, 'viewer')";
    await queryAsRole(testConfig().database.adminUrl, grant, [base.split("/").at(-1), viewer.userId]);
    expect((await viewer.call("GET", `${base}/editions/${edition.id}`)).body.title).toBe("Private");
    expect((await viewer.call("PUT", `${base}/editions/${edition.id}/tracks`, { discs: [] })).status).toBe(403);
    expect((await viewer.call("POST", `${base}/albums/${album.id}/editions`, { title: "Bootleg", kind: "unknown" })).status).toBe(403);
    const stranger = await signedInApi(server, pools, "album-stranger");
    expect((await stranger.call("GET", `${base}/albums/${album.id}`)).status).toBe(404);
    expect((await stranger.call("PUT", `${base}/albums/${album.id}/tracks`, { discs: [] })).status).toBe(403);
  });
});
