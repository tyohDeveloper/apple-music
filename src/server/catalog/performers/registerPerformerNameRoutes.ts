// A performer's names: add, edit (including making one preferred) and remove. Each answers
// with the performer as it now stands. Removing the preferred name is refused at commit.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { createPerformerNameRequestSchema } from "../../../contracts/performers/createPerformerNameRequestSchema.ts";
import { performerDetailSchema } from "../../../contracts/performers/performerDetailSchema.ts";
import { performerNameParamsSchema } from "../../../contracts/performers/performerNameParamsSchema.ts";
import { performerParamsSchema } from "../../../contracts/performers/performerParamsSchema.ts";
import { updatePerformerNameRequestSchema } from "../../../contracts/performers/updatePerformerNameRequestSchema.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { addPerformerName, removePerformerName, updatePerformerName } from "../../../db/catalog/performers/performerNameWrites.ts";
import { getPerformerDetail } from "../../../db/catalog/performers/performerQueries.ts";
import { runInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { libraryScopeOf, type CatalogApp } from "../typedRoutes.ts";

const names = "/api/libraries/:libraryId/performers/:performerId/names";
const oneName = `${names}/:nameId`;

function registerAdd(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: performerParamsSchema, body: createPerformerNameRequestSchema, response: { 201: performerDetailSchema } };
  app.post(names, { schema }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const { sortName = null, locale = null, validFrom = null, validTo = null, isPreferred = false } = request.body;
    const fields = { name: request.body.name, kind: request.body.kind, sortName, locale, validFrom, validTo, isPreferred };
    const detail = await runInLibrary(db, scope, async (tx) => {
      await addPerformerName(tx, scope.libraryId, request.params.performerId, fields);
      return requireFound(await getPerformerDetail(tx, request.params.performerId));
    });
    return reply.status(201).send(detail);
  });
}

function registerUpdate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: performerNameParamsSchema, body: updatePerformerNameRequestSchema, response: { 200: performerDetailSchema } };
  app.patch(oneName, { schema }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      const { performerId, nameId } = request.params;
      if (!(await updatePerformerName(tx, performerId, nameId, request.body))) throw new CatalogRefusal("not-found");
      return requireFound(await getPerformerDetail(tx, performerId));
    }),
  );
}

function registerRemove(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: performerNameParamsSchema, response: { 200: performerDetailSchema } };
  app.delete(oneName, { schema }, (request) =>
    runInLibrary(
      db,
      libraryScopeOf(request, request.params),
      async (tx) => {
        const { performerId, nameId } = request.params;
        if (!(await removePerformerName(tx, performerId, nameId))) throw new CatalogRefusal("not-found");
        return requireFound(await getPerformerDetail(tx, performerId));
      },
      "conflict-in-use",
    ),
  );
}

export function registerPerformerNameRoutes(app: CatalogApp, db: NodePgDatabase): void {
  registerAdd(app, db);
  registerUpdate(app, db);
  registerRemove(app, db);
}
