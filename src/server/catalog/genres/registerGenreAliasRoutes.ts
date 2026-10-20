// A genre's aliases: add and remove. Each answers with the genre as it now stands; an alias
// already naming a genre in the library answers 409 conflict-duplicate.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { createGenreAliasRequestSchema } from "../../../contracts/genres/createGenreAliasRequestSchema.ts";
import { genreAliasParamsSchema } from "../../../contracts/genres/genreAliasParamsSchema.ts";
import { genreDetailSchema } from "../../../contracts/genres/genreDetailSchema.ts";
import { genreParamsSchema } from "../../../contracts/genres/genreParamsSchema.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { getGenreDetail } from "../../../db/catalog/genres/genreQueries.ts";
import { addGenreAlias, deleteGenreAlias } from "../../../db/catalog/genres/genreWrites.ts";
import { writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { libraryScopeOf, type CatalogApp } from "../typedRoutes.ts";

const aliases = "/api/libraries/:libraryId/genres/:genreId/aliases";

function registerAdd(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: genreParamsSchema, body: createGenreAliasRequestSchema, response: { 201: genreDetailSchema } };
  app.post(aliases, { schema }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const detail = await writeInLibrary(db, scope, async (tx) => {
      await addGenreAlias(tx, scope.libraryId, request.params.genreId, request.body.name);
      return requireFound(await getGenreDetail(tx, request.params.genreId));
    });
    return reply.status(201).send(detail);
  });
}

function registerRemove(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: genreAliasParamsSchema, response: { 200: genreDetailSchema } };
  app.delete(`${aliases}/:aliasId`, { schema }, (request) =>
    writeInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      const { genreId, aliasId } = request.params;
      if (!(await deleteGenreAlias(tx, genreId, aliasId))) throw new CatalogRefusal("not-found");
      return requireFound(await getGenreDetail(tx, genreId));
    }),
  );
}

export function registerGenreAliasRoutes(app: CatalogApp, db: NodePgDatabase): void {
  registerAdd(app, db);
  registerRemove(app, db);
}
