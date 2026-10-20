// Library lists and catalog lookups of the fake Apple Music API, served from a fixture
// library in Apple's documented shapes: pages of at most 100 whose `next` carries only
// `offset` (Apple's paging guide), relationships rendered only when a library request
// includes them, catalog lookups of at most 300 songs or 100 albums answering only the ids
// found, and an empty answer for another storefront.
import type { FastifyInstance, FastifyReply } from "fastify";
import type { FakeItem, FakeLibrary } from "./appleMusicFixture.ts";

export type FakeLibraryHolder = { current: FakeLibrary };
type Kinds = Readonly<Record<string, { readonly type: string; readonly related: Readonly<Record<string, string>> }>>;
type Query = Readonly<Record<string, string | undefined>>;

const libraryKinds: Kinds = {
  songs: { type: "library-songs", related: { albums: "library-albums", artists: "library-artists", catalog: "songs" } },
  albums: { type: "library-albums", related: { artists: "library-artists", catalog: "albums" } },
  artists: { type: "library-artists", related: { catalog: "artists" } },
  playlists: { type: "library-playlists", related: { catalog: "playlists" } },
};
const catalogKinds: Kinds = { songs: { type: "songs", related: { albums: "albums", artists: "artists" } }, albums: { type: "albums", related: { artists: "artists" } } };
const catalogLimits: Readonly<Record<string, number>> = { songs: 300, albums: 100 };

export const fakeErrorBody = (status: number) => ({ errors: [{ id: `fake-${status}`, status: String(status), code: `${status}00`, title: "Fake Apple Music error" }] });

function rendered(item: FakeItem, kind: Kinds[string], href: string, include: readonly string[]) {
  const names = include.filter((name) => kind.related[name] !== undefined);
  const relationships = Object.fromEntries(names.map((name) => [name, {
    href: `${href}/${name}`,
    data: (item.relationships[name] ?? []).map((id) => ({ id, type: kind.related[name] })),
  }]));
  return { id: item.id, type: kind.type, href, attributes: item.attributes, ...(names.length > 0 ? { relationships } : {}) };
}

function libraryPage(library: FakeLibrary, name: string, query: Query, reply: FastifyReply) {
  const kind = libraryKinds[name];
  const limit = Number(query["limit"] ?? "25");
  const offset = Number(query["offset"] ?? "0");
  if (kind === undefined) return reply.status(404).send(fakeErrorBody(404));
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0) return reply.status(400).send(fakeErrorBody(400));
  const items = library[name as "songs"];
  const include = (query["include"] ?? "").split(",").filter((part) => part !== "");
  const data = items.slice(offset, offset + limit).map((item) => rendered(item, kind, `/v1/me/library/${name}/${item.id}`, include));
  return { data, ...(offset + limit < items.length ? { next: `/v1/me/library/${name}?offset=${offset + limit}` } : {}), meta: { total: items.length } };
}

function catalogLookup(library: FakeLibrary, storefront: string, name: string, query: Query, reply: FastifyReply) {
  const kind = catalogKinds[name];
  const ids = (query["ids"] ?? "").split(",").filter((id) => id !== "");
  if (kind === undefined) return reply.status(404).send(fakeErrorBody(404));
  if (ids.length === 0 || ids.length > (catalogLimits[name] ?? 0)) return reply.status(400).send(fakeErrorBody(400));
  const items = storefront === "us" ? (name === "songs" ? library.catalogSongs : library.catalogAlbums) : [];
  const found = ids.flatMap((id) => items.filter((item) => item.id === id));
  return { data: found.map((item) => rendered(item, kind, `/v1/catalog/${storefront}/${name}/${item.id}`, Object.keys(item.relationships))) };
}

export function registerFakeLibraryRoutes(app: FastifyInstance, holder: FakeLibraryHolder): void {
  app.get<{ Params: { kind: string }; Querystring: Query }>("/v1/me/library/:kind", async (request, reply) =>
    libraryPage(holder.current, request.params.kind, request.query, reply));
  app.get<{ Params: { storefront: string; kind: string }; Querystring: Query }>("/v1/catalog/:storefront/:kind", async (request, reply) =>
    catalogLookup(holder.current, request.params.storefront, request.params.kind, request.query, reply));
}
