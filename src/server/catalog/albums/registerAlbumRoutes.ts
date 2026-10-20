// Album routes (docs/design/catalog.md, slice C): search, create, read, edit, delete. An
// album with editions is not deleted (409).
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { albumDetailSchema } from "../../../contracts/albums/albumDetailSchema.ts";
import { albumPageQuerySchema } from "../../../contracts/albums/albumPageQuerySchema.ts";
import { albumPageSchema } from "../../../contracts/albums/albumPageSchema.ts";
import { albumParamsSchema } from "../../../contracts/albums/albumParamsSchema.ts";
import { createAlbumRequestSchema, type CreateAlbumRequest } from "../../../contracts/albums/createAlbumRequestSchema.ts";
import { updateAlbumRequestSchema } from "../../../contracts/albums/updateAlbumRequestSchema.ts";
import { libraryParamsSchema } from "../../../contracts/catalog/libraryParamsSchema.ts";
import { getAlbumDetail, listAlbums } from "../../../db/catalog/albums/albumQueries.ts";
import { createAlbum, deleteAlbum, updateAlbum, type AlbumFields } from "../../../db/catalog/albums/albumWrites.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { runInLibrary, writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { libraryScopeOf, pageRequestOf, type CatalogApp } from "../typedRoutes.ts";

const collection = "/api/libraries/:libraryId/albums";
const item = "/api/libraries/:libraryId/albums/:albumId";

function fieldsOf(body: CreateAlbumRequest): AlbumFields {
  const { released = null, label = null, notes = null } = body;
  return { title: body.title, kind: body.kind, released, label, notes };
}

function registerList(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: libraryParamsSchema, querystring: albumPageQuerySchema, response: { 200: albumPageSchema } };
  app.get(collection, { schema }, (request) => {
    const { performerId, recordingId, genreId } = request.query;
    return runInLibrary(db, libraryScopeOf(request, request.params), (tx) => listAlbums(tx, pageRequestOf(request.query), { performerId, recordingId, genreId }));
  });
}

function registerCreate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: libraryParamsSchema, body: createAlbumRequestSchema, response: { 201: albumDetailSchema } };
  app.post(collection, { schema }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const detail = await writeInLibrary(db, scope, async (tx) => {
      const id = await createAlbum(tx, scope.libraryId, fieldsOf(request.body));
      return requireFound(await getAlbumDetail(tx, id));
    });
    return reply.status(201).send(detail);
  });
}

function registerRead(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: albumParamsSchema, response: { 200: albumDetailSchema } };
  app.get(item, { schema }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), async (tx) => requireFound(await getAlbumDetail(tx, request.params.albumId))),
  );
}

function registerUpdate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: albumParamsSchema, body: updateAlbumRequestSchema, response: { 200: albumDetailSchema } };
  app.patch(item, { schema }, (request) =>
    writeInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      if (!(await updateAlbum(tx, request.params.albumId, request.body))) throw new CatalogRefusal("not-found");
      return requireFound(await getAlbumDetail(tx, request.params.albumId));
    }),
  );
}

function registerDelete(app: CatalogApp, db: NodePgDatabase): void {
  app.delete(item, { schema: { params: albumParamsSchema } }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const deleted = await writeInLibrary(db, scope, (tx) => deleteAlbum(tx, request.params.albumId), "conflict-in-use");
    if (!deleted) throw new CatalogRefusal("not-found");
    return reply.status(204).send();
  });
}

export function registerAlbumRoutes(app: CatalogApp, db: NodePgDatabase): void {
  registerList(app, db);
  registerCreate(app, db);
  registerRead(app, db);
  registerUpdate(app, db);
  registerDelete(app, db);
}
