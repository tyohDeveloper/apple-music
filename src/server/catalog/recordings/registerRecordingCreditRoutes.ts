// PUT /recordings/{id}/credits replaces the ordered credit list and answers with the
// recording. A performer or credited name that is not in the library, or a name that is
// not the credited performer's, answers 404.
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { replaceCreditsRequestSchema } from "../../../contracts/credits/replaceCreditsRequestSchema.ts";
import { recordingDetailSchema } from "../../../contracts/recordings/recordingDetailSchema.ts";
import { recordingParamsSchema } from "../../../contracts/recordings/recordingParamsSchema.ts";
import { CatalogRefusal, requireFound } from "../../../db/catalog/catalogRefusal.ts";
import { getRecordingDetail } from "../../../db/catalog/recordings/recordingQueries.ts";
import { replaceRecordingCredits } from "../../../db/catalog/recordings/recordingWrites.ts";
import { writeInLibrary } from "../../../db/catalog/runInLibrary.ts";
import { creditFieldsOf } from "../creditFieldsOf.ts";
import { libraryScopeOf, type CatalogApp } from "../typedRoutes.ts";

const credits = "/api/libraries/:libraryId/recordings/:recordingId/credits";

export function registerRecordingCreditRoutes(app: CatalogApp, db: NodePgDatabase): void {
  const schema = { params: recordingParamsSchema, body: replaceCreditsRequestSchema, response: { 200: recordingDetailSchema } };
  app.put(credits, { schema }, (request) => {
    const scope = libraryScopeOf(request, request.params);
    return writeInLibrary(db, scope, async (tx) => {
      const { recordingId } = request.params;
      if (!(await replaceRecordingCredits(tx, scope.libraryId, recordingId, creditFieldsOf(request.body)))) throw new CatalogRefusal("not-found");
      return requireFound(await getRecordingDetail(tx, recordingId));
    });
  });
}
