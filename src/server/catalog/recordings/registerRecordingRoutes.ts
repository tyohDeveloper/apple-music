// Recording routes (docs/design/catalog.md, slice B): search, create, read, edit, delete.
// Each runs in the library scope; refusals become 4xx replies (registerErrorReplies.ts).
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { libraryParamsSchema } from "../../../contracts/catalog/libraryParamsSchema.ts";
import { createRecordingRequestSchema, type CreateRecordingRequest } from "../../../contracts/recordings/createRecordingRequestSchema.ts";
import { recordingDetailSchema } from "../../../contracts/recordings/recordingDetailSchema.ts";
import { recordingPageQuerySchema } from "../../../contracts/recordings/recordingPageQuerySchema.ts";
import { recordingPageSchema } from "../../../contracts/recordings/recordingPageSchema.ts";
import { recordingParamsSchema } from "../../../contracts/recordings/recordingParamsSchema.ts";
import { updateRecordingRequestSchema } from "../../../contracts/recordings/updateRecordingRequestSchema.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { getRecordingDetail, listRecordings } from "../../../db/catalog/recordings/recordingQueries.ts";
import { createRecording, deleteRecording, updateRecording, type RecordingFields } from "../../../db/catalog/recordings/recordingWrites.ts";
import { runInLibrary, writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { libraryScopeOf, pageRequestOf, type CatalogApp } from "../typedRoutes.ts";

const collection = "/api/libraries/:libraryId/recordings";
const item = "/api/libraries/:libraryId/recordings/:recordingId";

function fieldsOf(body: CreateRecordingRequest): RecordingFields {
  const { versionNote = null, recordedFrom = null, recordedTo = null, venue = null, durationMs = null, notes = null } = body;
  return { title: body.title, kind: body.kind, versionNote, recordedFrom, recordedTo, venue, durationMs, notes };
}

function registerList(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: libraryParamsSchema, querystring: recordingPageQuerySchema, response: { 200: recordingPageSchema } };
  app.get(collection, { schema }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), (tx) => listRecordings(tx, pageRequestOf(request.query), request.query.performerId)),
  );
}

function registerCreate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: libraryParamsSchema, body: createRecordingRequestSchema, response: { 201: recordingDetailSchema } };
  app.post(collection, { schema }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const detail = await writeInLibrary(db, scope, async (tx) => {
      const id = await createRecording(tx, scope.libraryId, fieldsOf(request.body));
      return requireFound(await getRecordingDetail(tx, id));
    });
    return reply.status(201).send(detail);
  });
}

function registerRead(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: recordingParamsSchema, response: { 200: recordingDetailSchema } };
  app.get(item, { schema }, (request) =>
    runInLibrary(db, libraryScopeOf(request, request.params), async (tx) => requireFound(await getRecordingDetail(tx, request.params.recordingId))),
  );
}

function registerUpdate(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: recordingParamsSchema, body: updateRecordingRequestSchema, response: { 200: recordingDetailSchema } };
  app.patch(item, { schema }, (request) =>
    writeInLibrary(db, libraryScopeOf(request, request.params), async (tx) => {
      if (!(await updateRecording(tx, request.params.recordingId, request.body))) throw new CatalogRefusal("not-found");
      return requireFound(await getRecordingDetail(tx, request.params.recordingId));
    }),
  );
}

function registerDelete(app: CatalogApp, db: NodePgDatabase): void {
  app.delete(item, { schema: { params: recordingParamsSchema } }, async (request, reply) => {
    const scope = libraryScopeOf(request, request.params);
    const deleted = await writeInLibrary(db, scope, (tx) => deleteRecording(tx, request.params.recordingId), "conflict-in-use");
    if (!deleted) throw new CatalogRefusal("not-found");
    return reply.status(204).send();
  });
}

export function registerRecordingRoutes(app: CatalogApp, db: NodePgDatabase): void {
  registerList(app, db);
  registerCreate(app, db);
  registerRead(app, db);
  registerUpdate(app, db);
  registerDelete(app, db);
}
