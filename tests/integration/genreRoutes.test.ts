// /api/libraries/{libraryId}/genres and the genres of albums, recordings and performers
// (slice D): the tree in path order, aliases, moves and their refusals, and assignments.
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { signedInApi, type SignedInApi } from "./support/signedInApi.ts";
import { buildTestServer, openTestPools } from "./support/testServices.ts";

let pools: DatabasePools;
let server: FastifyInstance;
let owner: SignedInApi;

beforeAll(async () => {
  pools = openTestPools();
  server = await buildTestServer(pools);
  owner = await signedInApi(server, pools, "genre-owner");
});

afterAll(async () => {
  await server.close();
  await pools.close();
});

async function newLibrary(label: string): Promise<string> {
  return `/api/libraries/${(await owner.call("POST", "/api/libraries", { label })).body.id}`;
}

async function created(path: string, payload: object) {
  const reply = await owner.call("POST", path, payload);
  expect(reply.status).toBe(201);
  return reply.body;
}

async function jazzTree(base: string) {
  const jazz = await created(`${base}/genres`, { name: "Jazz" });
  const cool = await created(`${base}/genres`, { name: "Cool  jazz", parentId: jazz.id });
  const bebop = await created(`${base}/genres`, { name: "Bebop", parentId: jazz.id });
  const blues = await created(`${base}/genres`, { name: "Blues", notes: "Twelve bars and more" });
  return { jazz, cool, bebop, blues };
}

describe("genres", () => {
  it("lists genres in tree order with their paths, found by name or alias", async () => {
    const base = await newLibrary("Genre tree");
    const { jazz, cool, blues } = await jazzTree(base);
    expect(cool).toMatchObject({ name: "Cool jazz", path: [{ id: jazz.id, name: "Jazz" }], aliases: [], subgenres: [] });
    expect(blues).toMatchObject({ notes: "Twelve bars and more", path: [], uses: { albums: 0, recordings: 0, performers: 0 } });
    const listed = (await owner.call("GET", `${base}/genres`)).body;
    expect(listed.items.map((genre: { name: string }) => genre.name)).toEqual(["Blues", "Jazz", "Bebop", "Cool jazz"]);
    expect(listed.items[1]).toEqual({ id: jazz.id, name: "Jazz", path: [], subgenreCount: 2, useCount: 0 });
    expect(listed.items[3]).toEqual({ id: cool.id, name: "Cool jazz", path: ["Jazz"], subgenreCount: 0, useCount: 0 });
    const aliased = await created(`${base}/genres/${cool.id}/aliases`, { name: "West Coast jazz" });
    expect(aliased.aliases).toEqual([{ id: expect.any(String), name: "West Coast jazz" }]);
    expect((await owner.call("GET", `${base}/genres?query=west+coast`)).body.items.map((genre: { id: string }) => genre.id)).toEqual([cool.id]);
    expect((await owner.call("GET", `${base}/genres/${jazz.id}`)).body.subgenres.map((genre: { name: string }) => genre.name)).toEqual(["Bebop", "Cool jazz"]);
  });

  it("refuses duplicate sibling names and aliases", async () => {
    const base = await newLibrary("Genre duplicates");
    const { jazz, cool, blues } = await jazzTree(base);
    expect((await owner.call("POST", `${base}/genres`, { name: "JAZZ" })).body).toEqual({ error: { code: "conflict-duplicate" } });
    expect((await owner.call("POST", `${base}/genres`, { name: "Bebop", parentId: jazz.id })).status).toBe(409);
    expect((await owner.call("POST", `${base}/genres`, { name: "Bebop", parentId: blues.id })).status).toBe(201);
    await created(`${base}/genres/${cool.id}/aliases`, { name: "West Coast jazz" });
    expect((await owner.call("POST", `${base}/genres/${blues.id}/aliases`, { name: "west coast jazz" })).status).toBe(409);
    expect((await owner.call("POST", `${base}/genres`, { name: "Orphan", parentId: crypto.randomUUID() })).status).toBe(404);
  });

  it("moves genres, but never under themselves or their own subgenres", async () => {
    const base = await newLibrary("Genre moves");
    const { jazz, cool, blues } = await jazzTree(base);
    expect((await owner.call("PATCH", `${base}/genres/${jazz.id}`, { parentId: cool.id })).body).toEqual({ error: { code: "conflict-genre-cycle" } });
    expect((await owner.call("PATCH", `${base}/genres/${jazz.id}`, { parentId: jazz.id })).body).toEqual({ error: { code: "conflict-genre-cycle" } });
    expect((await owner.call("PATCH", `${base}/genres/${cool.id}`, { parentId: blues.id })).body.path).toEqual([{ id: blues.id, name: "Blues" }]);
    const moved = await owner.call("PATCH", `${base}/genres/${blues.id}`, { parentId: jazz.id, name: "Jazz blues" });
    expect(moved.body).toMatchObject({ name: "Jazz blues", path: [{ id: jazz.id, name: "Jazz" }] });
    expect((await owner.call("GET", `${base}/genres/${cool.id}`)).body.path.map((genre: { name: string }) => genre.name)).toEqual(["Jazz", "Jazz blues"]);
    expect((await owner.call("PATCH", `${base}/genres/${cool.id}`, { parentId: null })).body.path).toEqual([]);
  });

  it("assigns ordered genres, lists what carries a genre, and keeps genres in use", async () => {
    const base = await newLibrary("Genre assignments");
    const { jazz, cool, bebop } = await jazzTree(base);
    const album = await created(`${base}/albums`, { title: "Birth of the Cool", kind: "compilation" });
    const recording = await created(`${base}/recordings`, { title: "Jeru", kind: "studio" });
    const performer = await created(`${base}/performers`, { kind: "person", name: "Gerry Mulligan" });
    const genreIds = [cool.id, jazz.id];
    expect((await owner.call("PUT", `${base}/albums/${album.id}/genres`, { genreIds })).body.genres).toEqual([{ id: cool.id, name: "Cool jazz" }, { id: jazz.id, name: "Jazz" }]);
    expect((await owner.call("PUT", `${base}/recordings/${recording.id}/genres`, { genreIds: [cool.id] })).body.genres).toEqual([{ id: cool.id, name: "Cool jazz" }]);
    expect((await owner.call("PUT", `${base}/performers/${performer.id}/genres`, { genreIds: [cool.id] })).status).toBe(200);
    expect((await owner.call("PUT", `${base}/albums/${album.id}/genres`, { genreIds: [cool.id, cool.id] })).status).toBe(400);
    expect((await owner.call("PUT", `${base}/albums/${album.id}/genres`, { genreIds: [crypto.randomUUID()] })).status).toBe(404);
    expect((await owner.call("PUT", `${base}/albums/${crypto.randomUUID()}/genres`, { genreIds })).status).toBe(404);
    for (const list of ["albums", "recordings", "performers"]) expect((await owner.call("GET", `${base}/${list}?genreId=${cool.id}`)).body.total).toBe(1);
    expect((await owner.call("GET", `${base}/recordings?genreId=${jazz.id}`)).body.total).toBe(0);
    expect((await owner.call("GET", `${base}/genres/${cool.id}`)).body.uses).toEqual({ albums: 1, recordings: 1, performers: 1 });
    expect((await owner.call("GET", `${base}/genres?query=cool`)).body.items[0].useCount).toBe(3);
    expect((await owner.call("DELETE", `${base}/genres/${cool.id}`)).body).toEqual({ error: { code: "conflict-in-use" } });
    expect((await owner.call("DELETE", `${base}/genres/${jazz.id}`)).status).toBe(409);
    expect((await owner.call("DELETE", `${base}/genres/${bebop.id}`)).status).toBe(204);
    expect((await owner.call("PUT", `${base}/albums/${album.id}/genres`, { genreIds: [] })).body.genres).toEqual([]);
    expect((await owner.call("DELETE", `${base}/recordings/${recording.id}`)).status).toBe(204);
    expect((await owner.call("GET", `${base}/genres/${cool.id}`)).body.uses).toEqual({ albums: 0, recordings: 0, performers: 1 });
  });

  it("removes aliases and deletes a genre with its aliases", async () => {
    const base = await newLibrary("Genre aliases");
    const { blues } = await jazzTree(base);
    const alias = (await created(`${base}/genres/${blues.id}/aliases`, { name: "Blues & Rhythm" })).aliases[0];
    expect((await owner.call("DELETE", `${base}/genres/${blues.id}/aliases/${alias.id}`)).body.aliases).toEqual([]);
    expect((await owner.call("DELETE", `${base}/genres/${blues.id}/aliases/${alias.id}`)).status).toBe(404);
    await created(`${base}/genres/${blues.id}/aliases`, { name: "Rhythm and blues" });
    expect((await owner.call("DELETE", `${base}/genres/${blues.id}`)).status).toBe(204);
    expect((await owner.call("GET", `${base}/genres?query=rhythm`)).body.total).toBe(0);
  });
});
