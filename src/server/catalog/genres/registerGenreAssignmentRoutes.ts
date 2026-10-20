// PUT /{albums,recordings,performers}/{id}/genres replaces the ordered genres and answers
// with the album, recording or performer. A genre that is not in the library answers 404.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { albumDetailSchema } from "../../../contracts/albums/albumDetailSchema.ts";
import { albumParamsSchema } from "../../../contracts/albums/albumParamsSchema.ts";
import { replaceGenresRequestSchema } from "../../../contracts/genres/replaceGenresRequestSchema.ts";
import { performerDetailSchema } from "../../../contracts/performers/performerDetailSchema.ts";
import { performerParamsSchema } from "../../../contracts/performers/performerParamsSchema.ts";
import { recordingDetailSchema } from "../../../contracts/recordings/recordingDetailSchema.ts";
import { recordingParamsSchema } from "../../../contracts/recordings/recordingParamsSchema.ts";
import { getAlbumDetail } from "../../../db/catalog/albums/albumQueries.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { albumGenres, performerGenres, recordingGenres, replaceGenres, type GenreSource } from "../../../db/catalog/genres/genreAssignments.ts";
import { getPerformerDetail } from "../../../db/catalog/performers/performerQueries.ts";
import { getRecordingDetail } from "../../../db/catalog/recordings/recordingQueries.ts";
import { writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import type { LibraryScope } from "../../../db/withLibraryScope.ts";
import type { ScopedTransaction } from "../../../db/withUserScope.ts";
import { libraryScopeOf, type CatalogApp } from "../typedRoutes.ts";

const base = "/api/libraries/:libraryId";

type Replacement<T> = { readonly source: GenreSource; readonly ownerId: string; readonly genreIds: string[]; readonly read: (tx: ScopedTransaction) => Promise<T | null> };

function replaced<T>(db: NodePgDatabase, scope: LibraryScope, { source, ownerId, genreIds, read }: Replacement<T>): Promise<T> {
  return writeInLibrary(db, scope, async (tx) => {
    if (!(await replaceGenres(tx, source, scope.libraryId, ownerId, genreIds))) throw new CatalogRefusal("not-found");
    return requireFound(await read(tx));
  });
}

export function registerGenreAssignmentRoutes(app: CatalogApp, db: NodePgDatabase): void {
  const body = replaceGenresRequestSchema;
  app.put(`${base}/albums/:albumId/genres`, { schema: { params: albumParamsSchema, body, response: { 200: albumDetailSchema } } }, (request) => {
    const { albumId } = request.params;
    const read = (tx: ScopedTransaction) => getAlbumDetail(tx, albumId);
    return replaced(db, libraryScopeOf(request, request.params), { source: albumGenres, ownerId: albumId, genreIds: request.body.genreIds, read });
  });
  app.put(`${base}/recordings/:recordingId/genres`, { schema: { params: recordingParamsSchema, body, response: { 200: recordingDetailSchema } } }, (request) => {
    const { recordingId } = request.params;
    const read = (tx: ScopedTransaction) => getRecordingDetail(tx, recordingId);
    return replaced(db, libraryScopeOf(request, request.params), { source: recordingGenres, ownerId: recordingId, genreIds: request.body.genreIds, read });
  });
  app.put(`${base}/performers/:performerId/genres`, { schema: { params: performerParamsSchema, body, response: { 200: performerDetailSchema } } }, (request) => {
    const { performerId } = request.params;
    const read = (tx: ScopedTransaction) => getPerformerDetail(tx, performerId);
    return replaced(db, libraryScopeOf(request, request.params), { source: performerGenres, ownerId: performerId, genreIds: request.body.genreIds, read });
  });
}
