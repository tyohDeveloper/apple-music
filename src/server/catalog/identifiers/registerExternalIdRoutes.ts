// PUT /{performers,albums,editions,recordings}/{id}/external-ids replaces the identifiers
// and answers with the entity. Each value is normalized and checked against its
// namespace's form for that kind of entity (src/identifiers); a value that fails answers
// 400 invalid-external-id, and repeats of one value are stored once.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { albumDetailSchema } from "../../../contracts/albums/albumDetailSchema.ts";
import { albumParamsSchema } from "../../../contracts/albums/albumParamsSchema.ts";
import { editionDetailSchema } from "../../../contracts/editions/editionDetailSchema.ts";
import { editionParamsSchema } from "../../../contracts/editions/editionParamsSchema.ts";
import type { ExternalId } from "../../../contracts/identifiers/externalIdSchema.ts";
import { replaceExternalIdsRequestSchema } from "../../../contracts/identifiers/replaceExternalIdsRequestSchema.ts";
import { performerDetailSchema } from "../../../contracts/performers/performerDetailSchema.ts";
import { performerParamsSchema } from "../../../contracts/performers/performerParamsSchema.ts";
import { recordingDetailSchema } from "../../../contracts/recordings/recordingDetailSchema.ts";
import { recordingParamsSchema } from "../../../contracts/recordings/recordingParamsSchema.ts";
import { getAlbumDetail } from "../../../db/catalog/albums/albumQueries.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { getEditionDetail } from "../../../db/catalog/editions/editionQueries.ts";
import * as stored from "../../../db/catalog/identifiers/externalIds.ts";
import { getPerformerDetail } from "../../../db/catalog/performers/performerQueries.ts";
import { getRecordingDetail } from "../../../db/catalog/recordings/recordingQueries.ts";
import { writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import type { LibraryScope } from "../../../db/withLibraryScope.ts";
import type { ScopedTransaction } from "../../../db/withUserScope.ts";
import type { ExternalIdOwner } from "../../../identifiers/externalIdFormatOf.ts";
import { normalizedExternalIdOf } from "../../../identifiers/normalizedExternalIdOf.ts";
import { libraryScopeOf, type CatalogApp } from "../typedRoutes.ts";

const base = "/api/libraries/:libraryId";

function normalizedIds(owner: ExternalIdOwner, ids: readonly ExternalId[]): stored.ExternalIdRow[] {
  const kept = new Map<string, stored.ExternalIdRow>();
  for (const { namespace, value } of ids) {
    const normalized = normalizedExternalIdOf(owner, namespace, value);
    if (normalized === null) throw new CatalogRefusal("invalid-external-id");
    kept.set(`${namespace} ${normalized}`, { namespace, value: normalized });
  }
  return [...kept.values()];
}

type Replacement<T> = {
  readonly owner: ExternalIdOwner;
  readonly source: stored.ExternalIdSource;
  readonly ownerId: string;
  readonly ids: readonly ExternalId[];
  readonly read: (tx: ScopedTransaction) => Promise<T | null>;
};

function replaced<T>(db: NodePgDatabase, scope: LibraryScope, { owner, source, ownerId, ids, read }: Replacement<T>): Promise<T> {
  const rows = normalizedIds(owner, ids);
  return writeInLibrary(db, scope, async (tx) => {
    if (!(await stored.replaceExternalIds(tx, source, scope.libraryId, ownerId, rows))) throw new CatalogRefusal("not-found");
    return requireFound(await read(tx));
  });
}

const body = replaceExternalIdsRequestSchema;

function registerPerformerIds(app: CatalogApp, db: NodePgDatabase): void {
  app.put(`${base}/performers/:performerId/external-ids`, { schema: { params: performerParamsSchema, body, response: { 200: performerDetailSchema } } }, (request) => {
    const { performerId: ownerId } = request.params;
    const read = (tx: ScopedTransaction) => getPerformerDetail(tx, ownerId);
    return replaced(db, libraryScopeOf(request, request.params), { owner: "performer", source: stored.performerExternalIds, ownerId, ids: request.body.externalIds, read });
  });
}

function registerAlbumIds(app: CatalogApp, db: NodePgDatabase): void {
  app.put(`${base}/albums/:albumId/external-ids`, { schema: { params: albumParamsSchema, body, response: { 200: albumDetailSchema } } }, (request) => {
    const { albumId: ownerId } = request.params;
    const read = (tx: ScopedTransaction) => getAlbumDetail(tx, ownerId);
    return replaced(db, libraryScopeOf(request, request.params), { owner: "album", source: stored.albumExternalIds, ownerId, ids: request.body.externalIds, read });
  });
}

function registerEditionIds(app: CatalogApp, db: NodePgDatabase): void {
  app.put(`${base}/editions/:editionId/external-ids`, { schema: { params: editionParamsSchema, body, response: { 200: editionDetailSchema } } }, (request) => {
    const { editionId: ownerId } = request.params;
    const read = (tx: ScopedTransaction) => getEditionDetail(tx, ownerId);
    return replaced(db, libraryScopeOf(request, request.params), { owner: "edition", source: stored.editionExternalIds, ownerId, ids: request.body.externalIds, read });
  });
}

function registerRecordingIds(app: CatalogApp, db: NodePgDatabase): void {
  app.put(`${base}/recordings/:recordingId/external-ids`, { schema: { params: recordingParamsSchema, body, response: { 200: recordingDetailSchema } } }, (request) => {
    const { recordingId: ownerId } = request.params;
    const read = (tx: ScopedTransaction) => getRecordingDetail(tx, ownerId);
    return replaced(db, libraryScopeOf(request, request.params), { owner: "recording", source: stored.recordingExternalIds, ownerId, ids: request.body.externalIds, read });
  });
}

export function registerExternalIdRoutes(app: CatalogApp, db: NodePgDatabase): void {
  registerPerformerIds(app, db);
  registerAlbumIds(app, db);
  registerEditionIds(app, db);
  registerRecordingIds(app, db);
}
