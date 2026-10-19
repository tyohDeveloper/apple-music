// Performer routes (docs/design/catalog.md, slice A): search, create, read, edit, delete.
// Each runs in the library scope; refusals become 4xx replies (registerErrorReplies.ts).
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { catalogPageQuerySchema } from "../../../contracts/catalog/catalogPageQuerySchema.ts";
import { libraryParamsSchema } from "../../../contracts/catalog/libraryParamsSchema.ts";
import { createPerformerRequestSchema, type CreatePerformerRequest } from "../../../contracts/performers/createPerformerRequestSchema.ts";
import { performerDetailSchema } from "../../../contracts/performers/performerDetailSchema.ts";
import { performerPageSchema } from "../../../contracts/performers/performerPageSchema.ts";
import { performerParamsSchema } from "../../../contracts/performers/performerParamsSchema.ts";
import { updatePerformerRequestSchema } from "../../../contracts/performers/updatePerformerRequestSchema.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { getPerformerDetail, listPerformers } from "../../../db/catalog/performers/performerQueries.ts";
import { createPerformer, deletePerformer, updatePerformer, type PerformerFields } from "../../../db/catalog/performers/performerWrites.ts";
import { runInLibrary, writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { libraryScopeOf, pageRequestOf, type CatalogApp } from "../typedRoutes.ts";

const collection = "/api/libraries/:libraryId/performers";
const item = "/api/libraries/:libraryId/performers/:performerId";

function fieldsOf(body: CreatePerformerRequest): PerformerFields {
  const { began = null, ended = null, area = null, disambiguation = null, notes = null } = body;
  return { kind: body.kind, began, ended, area, disambiguation, notes };
}

function registerList(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: libraryParamsSchema, querystring: catalogPageQuerySchema, response: { 200: performerPageSchema } };
  app.get(collection, { schema }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), (tx) => listPerformers(tx, pageRequestOf(request.query))),
  );
}

function registerCreate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: libraryParamsSchema, body: createPerformerRequestSchema, response: { 201: performerDetailSchema } };
  app.post(collection, { schema }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const name = { name: request.body.name, sortName: request.body.sortName ?? null, kind: "primary", locale: null, validFrom: null, validTo: null };
    const detail = await writeInLibrary(db, scope, async (tx) => {
      const id = await createPerformer(tx, scope.libraryId, fieldsOf(request.body), name);
      return requireFound(await getPerformerDetail(tx, id));
    });
    return reply.status(201).send(detail);
  });
}

function registerRead(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: performerParamsSchema, response: { 200: performerDetailSchema } };
  app.get(item, { schema }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), async (tx) => requireFound(await getPerformerDetail(tx, request.params.performerId))),
  );
}

function registerUpdate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: performerParamsSchema, body: updatePerformerRequestSchema, response: { 200: performerDetailSchema } };
  app.patch(item, { schema }, (request) =>
    writeInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      if (!(await updatePerformer(tx, request.params.performerId, request.body))) throw new CatalogRefusal("not-found");
      return requireFound(await getPerformerDetail(tx, request.params.performerId));
    }),
  );
}

function registerDelete(app: CatalogApp, db: NodePgDatabase): void {
  app.delete(item, { schema: { params: performerParamsSchema } }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const deleted = await writeInLibrary(db, scope, (tx) => deletePerformer(tx, request.params.performerId), "conflict-in-use");
    if (!deleted) throw new CatalogRefusal("not-found");
    return reply.status(204).send();
  });
}

export function registerPerformerRoutes(app: CatalogApp, db: NodePgDatabase): void {
  registerList(app, db);
  registerCreate(app, db);
  registerRead(app, db);
  registerUpdate(app, db);
  registerDelete(app, db);
}
