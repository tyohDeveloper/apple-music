// Relations from a performer (the subject) to another performer: add and remove. Each
// answers with the performer as it now stands.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { createPerformerRelationRequestSchema } from "../../../contracts/performers/createPerformerRelationRequestSchema.ts";
import { performerDetailSchema } from "../../../contracts/performers/performerDetailSchema.ts";
import { performerParamsSchema } from "../../../contracts/performers/performerParamsSchema.ts";
import { performerRelationParamsSchema } from "../../../contracts/performers/performerRelationParamsSchema.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { getPerformerDetail } from "../../../db/catalog/performers/performerQueries.ts";
import { addPerformerRelation, removePerformerRelation } from "../../../db/catalog/performers/performerRelationWrites.ts";
import { runInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { libraryScopeOf, type CatalogApp } from "../typedRoutes.ts";

const relations = "/api/libraries/:libraryId/performers/:performerId/relations";

function registerAdd(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: performerParamsSchema, body: createPerformerRelationRequestSchema, response: { 201: performerDetailSchema } };
  app.post(relations, { schema }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const { roles = [], began = null, ended = null, notes = null } = request.body;
    const fields = { kind: request.body.kind, objectId: request.body.objectId, roles, began, ended, notes };
    const detail = await runInLibrary(db, scope, async (tx) => {
      await addPerformerRelation(tx, scope.libraryId, request.params.performerId, fields);
      return requireFound(await getPerformerDetail(tx, request.params.performerId));
    });
    return reply.status(201).send(detail);
  });
}

function registerRemove(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: performerRelationParamsSchema, response: { 200: performerDetailSchema } };
  app.delete(`${relations}/:relationId`, { schema }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      const { performerId, relationId } = request.params;
      if (!(await removePerformerRelation(tx, performerId, relationId))) throw new CatalogRefusal("not-found");
      return requireFound(await getPerformerDetail(tx, performerId));
    }),
  );
}

export function registerPerformerRelationRoutes(app: CatalogApp, db: NodePgDatabase): void {
  registerAdd(app, db);
  registerRemove(app, db);
}
