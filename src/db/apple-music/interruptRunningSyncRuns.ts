// At start, before traffic is accepted, a run still marked running belongs to a server that
// stopped without finishing it: mark it interrupted so the library can start another
// (docs/design/apple-music-import.md, Decisions). Uses the owner role, as migrations do,
// because no user scope exists yet. Answers how many were marked.
import pg from "pg";

export async function interruptRunningSyncRuns(adminUrl: string): Promise<number> {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    const result = await client.query("update sync_run set status = 'interrupted', finished_at = now() where status = 'running'");
    return result.rowCount ?? 0;
  } finally {
    await client.end();
  }
}
