// GET /api/libraries/{libraryId}/export: the whole curated catalog as one snapshot that
// matches docs/schemas/library-export.schema.json, refers only to its own entries, holds
// nothing of another library, and is open to every member and no one else (slice F).
import { readFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { signedInApi, type SignedInApi } from "./support/signedInApi.ts";
import { buildTestServer, openTestPools, queryAsRole, testConfig } from "./support/testServices.ts";

let pools: DatabasePools;
let server: FastifyInstance;
let owner: SignedInApi;
let libraryId: string;
let base: string;

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats.default(ajv);
const validate = ajv.compile(JSON.parse(readFileSync("docs/schemas/library-export.schema.json", "utf8")) as object);

beforeAll(async () => {
  pools = openTestPools();
  server = await buildTestServer(pools);
  owner = await signedInApi(server, pools, "export-owner");
  libraryId = (await owner.call("POST", "/api/libraries", { label: "Export tests: Jazz & Blues" })).body.id;
  base = `/api/libraries/${libraryId}`;
});

afterAll(async () => {
  await server.close();
  await pools.close();
});

async function created(path: string, payload: object, library = base) {
  const reply = await owner.call("POST", `${library}${path}`, payload);
  expect(reply.status).toBe(201);
  return reply.body;
}

async function performersAndGenres() {
  const jazz = await created("/genres", { name: "Jazz" });
  const cool = await created("/genres", { name: "Cool jazz", parentId: jazz.id });
  await owner.call("POST", `${base}/genres/${cool.id}/aliases`, { name: "West Coast jazz" });
  const miles = await created("/performers", { kind: "person", name: "Miles Davis" });
  const named = await owner.call("POST", `${base}/performers/${miles.id}/names`, { name: "Miles Dewey Davis III", kind: "birth" });
  const birthName = named.body.names.find((name: { name: string }) => name.name === "Miles Dewey Davis III");
  const quintet = await created("/performers", { kind: "group", name: "Miles Davis Quintet" });
  await owner.call("POST", `${base}/performers/${miles.id}/relations`, { kind: "member-of", objectId: quintet.id, roles: ["trumpet"] });
  return { jazz, cool, miles, birthName, quintet };
}

async function catalog() {
  const { jazz, cool, miles, birthName, quintet } = await performersAndGenres();
  const take = await created("/recordings", { title: "So What", kind: "studio", recordedFrom: "1959-03-02" });
  await owner.call("PUT", `${base}/recordings/${take.id}/credits`, { credits: [{ performerId: miles.id, role: "primary", creditedNameId: birthName.id, instruments: ["trumpet"] }] });
  await owner.call("PUT", `${base}/recordings/${take.id}/genres`, { genreIds: [cool.id, jazz.id] });
  await owner.call("PUT", `${base}/recordings/${take.id}/external-ids`, { externalIds: [{ namespace: "isrc", value: "us-sm1-59-00113" }] });
  const album = await created("/albums", { title: "Kind of Blue", kind: "album", released: "1959-08-17" });
  await owner.call("PUT", `${base}/albums/${album.id}/tracks`, { discs: [{ tracks: [{ recordingId: take.id, label: "A1" }] }] });
  await owner.call("PUT", `${base}/albums/${album.id}/genres`, { genreIds: [jazz.id] });
  const edition = await created(`/albums/${album.id}/editions`, { title: "Kind of Blue (Legacy Edition)", kind: "expanded", released: "2009" });
  const editionTracks = [{ title: "So What", recordingId: take.id, inclusion: "core" }, { title: "Interview", inclusion: "interview" }];
  await owner.call("PUT", `${base}/editions/${edition.id}/tracks`, { discs: [{ tracks: editionTracks }] });
  await owner.call("PUT", `${base}/editions/${edition.id}/external-ids`, { externalIds: [{ namespace: "upc", value: "0 74646 52222 7" }] });
  return { jazz, cool, miles, birthName, quintet, take, album };
}

type Entry = { readonly id: string };
type Document = Record<string, any>;

// Every id the document refers to names an entry of the same document.
function danglingReferencesOf(document: Document): string[] {
  const ids = (entries: readonly Entry[]) => new Set(entries.map((entry) => entry.id));
  const [genres, performers, recordings] = [ids(document.genres), ids(document.performers), ids(document.recordings)];
  const names = ids(document.performers.flatMap((performer: Document) => performer.names));
  const credits = [...document.recordings, ...document.albums].flatMap((entry: Document) => entry.credits);
  const editionTracks = document.albums.flatMap((album: Document) => album.editions.flatMap((edition: Document) => edition.tracks));
  const references: [Set<string>, string | null][] = [
    ...document.genres.map((genre: Document) => [genres, genre.parentId]),
    ...[...document.performers, ...document.recordings, ...document.albums].flatMap((entry: Document) => entry.genreIds.map((id: string) => [genres, id])),
    ...document.performerRelations.flatMap((relation: Document) => [[performers, relation.subjectId], [performers, relation.objectId]]),
    ...credits.flatMap((credit: Document) => [[performers, credit.performerId], [names, credit.creditedNameId]]),
    ...document.albums.flatMap((album: Document) => album.tracks.map((track: Document) => [recordings, track.recordingId])),
    ...editionTracks.map((track: Document) => [recordings, track.recordingId]),
  ];
  return references.flatMap(([known, id]) => (id === null || known.has(id) ? [] : [id]));
}

describe("library export", () => {
  it("answers the catalog as one download that matches the published schema", async () => {
    const { jazz, cool, miles, birthName, quintet, take, album } = await catalog();
    const reply = await owner.get(`${base}/export`);
    expect(reply.statusCode).toBe(200);
    expect(reply.headers["content-disposition"]).toMatch(/^attachment; filename="export-tests-jazz-blues-\d{4}-\d{2}-\d{2}\.json"$/u);
    const document = reply.json();
    expect(validate(document) ? [] : validate.errors).toEqual([]);
    expect(danglingReferencesOf(document)).toEqual([]);
    expect(document).toMatchObject({ format: "apple-music-library-export", formatVersion: 1, application: { name: "apple-music" }, library: { id: libraryId, label: "Export tests: Jazz & Blues" } });
    expect(document.genres).toEqual([expect.objectContaining({ id: jazz.id, parentId: null }), expect.objectContaining({ id: cool.id, parentId: jazz.id, aliases: [expect.objectContaining({ name: "West Coast jazz" })] })]);
    expect(document.performers[0].names.map((name: Document) => [name.name, name.isPreferred])).toEqual([["Miles Davis", true], ["Miles Dewey Davis III", false]]);
    expect(document.performerRelations).toEqual([expect.objectContaining({ subjectId: miles.id, objectId: quintet.id, kind: "member-of", roles: ["trumpet"] })]);
    const [recording] = document.recordings;
    expect(recording).toMatchObject({ id: take.id, recordedFrom: "1959-03-02", genreIds: [cool.id, jazz.id], externalIds: [{ namespace: "isrc", value: "USSM15900113" }] });
    expect(recording.credits).toEqual([{ performerId: miles.id, creditedNameId: birthName.id, role: "primary", joinPhrase: null, instruments: ["trumpet"] }]);
    const [exported] = document.albums;
    expect(exported).toMatchObject({ id: album.id, tracks: [{ discIndex: 0, position: 0, recordingId: take.id, title: null, label: "A1" }], genreIds: [jazz.id] });
    expect(exported.editions[0].tracks[1]).toEqual({ discIndex: 0, position: 1, title: "Interview", recordingId: null, inclusion: "interview" });
    expect(exported.editions[0].externalIds).toEqual([{ namespace: "upc", value: "074646522227" }]);
  });

  it("holds nothing of another library, and an unchanged library exports the same twice", async () => {
    const elsewhere = `/api/libraries/${(await owner.call("POST", "/api/libraries", { label: "Elsewhere" })).body.id}`;
    await created("/performers", { kind: "person", name: "Only Elsewhere" }, elsewhere);
    const first = (await owner.get(`${base}/export`)).json();
    const second = (await owner.get(`${base}/export`)).json();
    expect(JSON.stringify(first)).not.toContain("Only Elsewhere");
    expect({ ...second, exportedAt: null }).toEqual({ ...first, exportedAt: null });
  });

  it("lets a viewer export and hides the library from anyone else", async () => {
    const viewer = await signedInApi(server, pools, "export-viewer");
    const grant = "insert into library_member (library_id, user_id, role) values ($1, $2, 'viewer')";
    await queryAsRole(testConfig().database.adminUrl, grant, [libraryId, viewer.userId]);
    expect((await viewer.get(`${base}/export`)).statusCode).toBe(200);
    const stranger = await signedInApi(server, pools, "export-stranger");
    expect((await stranger.get(`${base}/export`)).statusCode).toBe(404);
  });
});
