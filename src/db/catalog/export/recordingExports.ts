// Every recording of the scoped library for its export, with its credits, genres and
// identifiers, in creation order.
import { sql } from "drizzle-orm";
import type { ExportRecording } from "../../../contracts/export/exportRecordingSchema.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import { recordingCredits } from "../credits/creditQueries.ts";
import { recordingGenres } from "../genres/genreAssignments.ts";
import { recordingExternalIds } from "../identifiers/externalIds.ts";
import { creditsJson, externalIdsJson, genreIdsJson, instantText } from "./exportFragments.ts";

export async function recordingExportsOf(tx: ScopedTransaction): Promise<ExportRecording[]> {
  const { rows } = await tx.execute<ExportRecording>(sql`
    select r.id, r.title, r.version_note as "versionNote", r.kind, r.recorded_from as "recordedFrom",
      r.recorded_to as "recordedTo", r.venue, r.duration_ms as "durationMs", r.notes,
      ${creditsJson(recordingCredits, "r")} as credits, ${genreIdsJson(recordingGenres, "r")} as "genreIds",
      ${externalIdsJson(recordingExternalIds, "r")} as "externalIds",
      ${instantText(sql`r.created_at`)} as "createdAt", ${instantText(sql`r.updated_at`)} as "updatedAt"
    from recording r order by r.created_at, r.id`);
  return rows;
}
