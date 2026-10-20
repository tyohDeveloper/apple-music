// Genre routes (docs/design/catalog.md, slice D): search in tree order, create, read, edit
// or move, delete. A move under one of the genre's own subgenres answers 409
// conflict-genre-cycle; deleting a genre with subgenres or uses answers 409 conflict-in-use.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { catalogPageQuerySchema } from "../../../contracts/catalog/catalogPageQuerySchema.ts";
import { libraryParamsSchema } from "../../../contracts/catalog/libraryParamsSchema.ts";
import { createGenreRequestSchema } from "../../../contracts/genres/createGenreRequestSchema.ts";
import { genreDetailSchema } from "../../../contracts/genres/genreDetailSchema.ts";
import { genrePageSchema } from "../../../contracts/genres/genrePageSchema.ts";
import { genreParamsSchema } from "../../../contracts/genres/genreParamsSchema.ts";
import { updateGenreRequestSchema } from "../../../contracts/genres/updateGenreRequestSchema.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { getGenreDetail, listGenres } from "../../../db/catalog/genres/genreQueries.ts";
import { createGenre, deleteGenre, updateGenre } from "../../../db/catalog/genres/genreWrites.ts";
import { runInLibrary, writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { libraryScopeOf, pageRequestOf, type CatalogApp } from "../typedRoutes.ts";

const collection = "/api/libraries/:libraryId/genres";
const item = "/api/libraries/:libraryId/genres/:genreId";

function registerList(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: libraryParamsSchema, querystring: catalogPageQuerySchema, response: { 200: genrePageSchema } };
  app.get(collection, { schema }, (request) => runInLibrary(db, libraryScopeOf(request, request.params), (tx) => listGenres(tx, pageRequestOf(request.query))));
}

function registerCreate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: libraryParamsSchema, body: createGenreRequestSchema, response: { 201: genreDetailSchema } };
  app.post(collection, { schema }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const { parentId = null, notes = null } = request.body;
    const detail = await writeInLibrary(db, scope, async (tx) => {
      const id = await createGenre(tx, scope.libraryId, { name: request.body.name, parentId, notes });
      return requireFound(await getGenreDetail(tx, id));
    });
    return reply.status(201).send(detail);
  });
}

function registerRead(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: genreParamsSchema, response: { 200: genreDetailSchema } };
  app.get(item, { schema }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), async (tx) => requireFound(await getGenreDetail(tx, request.params.genreId))),
  );
}

function registerUpdate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: genreParamsSchema, body: updateGenreRequestSchema, response: { 200: genreDetailSchema } };
  app.patch(item, { schema }, (request) =>
    writeInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      if (!(await updateGenre(tx, request.params.genreId, request.body))) throw new CatalogRefusal("not-found");
      return requireFound(await getGenreDetail(tx, request.params.genreId));
    }),
  );
}

function registerDelete(app: CatalogApp, db: NodePgDatabase): void {
  app.delete(item, { schema: { params: genreParamsSchema } }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const deleted = await writeInLibrary(db, scope, (tx) => deleteGenre(tx, request.params.genreId), "conflict-in-use");
    if (!deleted) throw new CatalogRefusal("not-found");
    return reply.status(204).send();
  });
}

export function registerGenreRoutes(app: CatalogApp, db: NodePgDatabase): void {
  registerList(app, db);
  registerCreate(app, db);
  registerRead(app, db);
  registerUpdate(app, db);
  registerDelete(app, db);
}
