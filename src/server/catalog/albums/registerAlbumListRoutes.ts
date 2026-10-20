// PUT /albums/{id}/credits and PUT /albums/{id}/tracks replace an album's ordered credits and
// its intended track list, and answer with the album. A performer, credited name or
// recording that is not in the library answers 404.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { albumDetailSchema } from "../../../contracts/albums/albumDetailSchema.ts";
import { albumParamsSchema } from "../../../contracts/albums/albumParamsSchema.ts";
import { replaceAlbumTracksRequestSchema, type ReplaceAlbumTracksRequest } from "../../../contracts/albums/replaceAlbumTracksRequestSchema.ts";
import { replaceCreditsRequestSchema } from "../../../contracts/credits/replaceCreditsRequestSchema.ts";
import { getAlbumDetail } from "../../../db/catalog/albums/albumQueries.ts";
import { replaceAlbumCredits, replaceAlbumTracks, type AlbumTrackFields } from "../../../db/catalog/albums/albumWrites.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { creditFieldsOf } from "../creditFieldsOf.ts";
import { libraryScopeOf, type CatalogApp } from "../typedRoutes.ts";

const item = "/api/libraries/:libraryId/albums/:albumId";

function trackFieldsOf(body: ReplaceAlbumTracksRequest): AlbumTrackFields[][] {
  return body.discs.map((disc) => disc.tracks.map(({ recordingId, title = null, label = null }) => ({ recordingId, title, label })));
}

export function registerAlbumListRoutes(app: CatalogApp, db: NodePgDatabase): void {
  const response = { 200: albumDetailSchema };
  app.put(`${item}/credits`, { schema: { params: albumParamsSchema, body: replaceCreditsRequestSchema, response } }, (request) => {
    const scope = libraryScopeOf(request, request.params);
    return writeInLibrary(db, scope, async (tx) => {
      if (!(await replaceAlbumCredits(tx, scope.libraryId, request.params.albumId, creditFieldsOf(request.body)))) throw new CatalogRefusal("not-found");
      return requireFound(await getAlbumDetail(tx, request.params.albumId));
    });
  });
  app.put(`${item}/tracks`, { schema: { params: albumParamsSchema, body: replaceAlbumTracksRequestSchema, response } }, (request) => {
    const scope = libraryScopeOf(request, request.params);
    return writeInLibrary(db, scope, async (tx) => {
      if (!(await replaceAlbumTracks(tx, scope.libraryId, request.params.albumId, trackFieldsOf(request.body)))) throw new CatalogRefusal("not-found");
      return requireFound(await getAlbumDetail(tx, request.params.albumId));
    });
  });
}
