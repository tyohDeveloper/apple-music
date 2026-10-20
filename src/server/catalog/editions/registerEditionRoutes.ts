// Edition routes (docs/design/catalog.md, slice C): create an edition of an album; read,
// edit (including moving it to another album), delete; replace its track list.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { albumParamsSchema } from "../../../contracts/albums/albumParamsSchema.ts";
import { createEditionRequestSchema } from "../../../contracts/editions/createEditionRequestSchema.ts";
import { editionDetailSchema } from "../../../contracts/editions/editionDetailSchema.ts";
import { editionParamsSchema } from "../../../contracts/editions/editionParamsSchema.ts";
import { replaceEditionTracksRequestSchema } from "../../../contracts/editions/replaceEditionTracksRequestSchema.ts";
import { updateEditionRequestSchema } from "../../../contracts/editions/updateEditionRequestSchema.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { getEditionDetail } from "../../../db/catalog/editions/editionQueries.ts";
import { createEdition, deleteEdition, replaceEditionTracks, updateEdition } from "../../../db/catalog/editions/editionWrites.ts";
import { runInLibrary, writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { libraryScopeOf, type CatalogApp } from "../typedRoutes.ts";

const item = "/api/libraries/:libraryId/editions/:editionId";

function registerCreate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: albumParamsSchema, body: createEditionRequestSchema, response: { 201: editionDetailSchema } };
  app.post("/api/libraries/:libraryId/albums/:albumId/editions", { schema }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const { title, kind, released = null, notes = null } = request.body;
    const detail = await writeInLibrary(db, scope, async (tx) => {
      const id = await createEdition(tx, scope.libraryId, { albumId: request.params.albumId, title, kind, released, notes });
      return requireFound(await getEditionDetail(tx, id));
    });
    return reply.status(201).send(detail);
  });
}

function registerReadAndUpdate(app: CatalogApp, db: NodePgDatabase): void {
  app.get(item, { schema: { params: editionParamsSchema, response: { 200: editionDetailSchema } } }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), async (tx) => requireFound(await getEditionDetail(tx, request.params.editionId))),
  );
  app.patch(item, { schema: { params: editionParamsSchema, body: updateEditionRequestSchema, response: { 200: editionDetailSchema } } }, (request) =>
    writeInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      if (!(await updateEdition(tx, request.params.editionId, request.body))) throw new CatalogRefusal("not-found");
      return requireFound(await getEditionDetail(tx, request.params.editionId));
    }),
  );
}

function registerDelete(app: CatalogApp, db: NodePgDatabase): void {
  app.delete(item, { schema: { params: editionParamsSchema } }, async (request, reply) => {
    const deleted = await writeInLibrary(db, libraryScopeOf(request, request.params), (tx) => deleteEdition(tx, request.params.editionId));
    if (!deleted) throw new CatalogRefusal("not-found");
    return reply.status(204).send();
  });
}

function registerTracks(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: editionParamsSchema, body: replaceEditionTracksRequestSchema, response: { 200: editionDetailSchema } };
  app.put(`${item}/tracks`, { schema }, (request) => {
    const scope = libraryScopeOf(request, request.params);
    const discs = request.body.discs.map((disc) => disc.tracks.map(({ title, inclusion, recordingId = null }) => ({ title, inclusion, recordingId })));
    return writeInLibrary(db, scope, async (tx) => {
      if (!(await replaceEditionTracks(tx, scope.libraryId, request.params.editionId, discs))) throw new CatalogRefusal("not-found");
      return requireFound(await getEditionDetail(tx, request.params.editionId));
    });
  });
}

export function registerEditionRoutes(app: CatalogApp, db: NodePgDatabase): void {
  registerCreate(app, db);
  registerReadAndUpdate(app, db);
  registerDelete(app, db);
  registerTracks(app, db);
}
