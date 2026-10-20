// Sync runs and the mirror's data access (docs/design/apple-music-import.md, slice H): one
// running run per library, change detection by value, removals, the guard's rollback,
// catalog upserts, the start-up sweep and row-level security.
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { upsertCatalogItems } from "../../src/db/apple-music/catalogItems.ts";
import { interruptRunningSyncRuns } from "../../src/db/apple-music/interruptRunningSyncRuns.ts";
import { catalogIdsSeenIn, forgetItemsFirstSeenIn, markUnseenRemoved, runChangeCountsOf, storedItemCount, upsertLibraryItems } from "../../src/db/apple-music/mirrorItems.ts";
import { finishSyncRun, latestSyncRun, recordSyncProgress, startSyncRun, syncRunOf, type RunIds } from "../../src/db/apple-music/syncRuns.ts";
import { runInLibrary } from "../../src/db/catalog/runInLibrary.ts";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { createOwnedLibrary } from "../../src/db/libraries/libraryMembership.ts";
import type { LibraryScope } from "../../src/db/withLibraryScope.ts";
import { withUserScope } from "../../src/db/withUserScope.ts";
import type { ScopedTransaction } from "../../src/db/withUserScope.ts";
import type { AppleResource } from "../../src/library-sync/appleResourcesOf.ts";
import { createTestUser, openTestPools, testConfig } from "./support/testServices.ts";

let pools: DatabasePools;
let ann: { id: string };
let bob: { id: string };
let libraryId: string;

const succeeded = { status: "succeeded", errorCode: null } as const;
const noChanges = { added: 0, changed: 0, removed: 0 };
const asAnn = <T>(work: (tx: ScopedTransaction) => Promise<T>) => runInLibrary(pools.app, { userId: ann.id, libraryId } satisfies LibraryScope, work);
const song = (id: string, name: string, catalog?: string): AppleResource => ({ id, attributes: { name }, relationships: catalog === undefined ? {} : { catalog: [catalog] } });

async function newRun(replaceMirror = false): Promise<RunIds> {
  const run = await asAnn((tx) => startSyncRun(tx, libraryId, ann.id, replaceMirror));
  return { libraryId, runId: run.id };
}

async function runOver(songs: readonly AppleResource[]): Promise<RunIds> {
  const ids = await newRun();
  await asAnn((tx) => upsertLibraryItems(tx, ids, "song", songs));
  await asAnn((tx) => markUnseenRemoved(tx, ids));
  await asAnn((tx) => finishSyncRun(tx, ids, succeeded, noChanges));
  return ids;
}

beforeAll(async () => {
  pools = openTestPools();
  ann = await createTestUser(pools, "ann");
  bob = await createTestUser(pools, "bob");
  libraryId = (await withUserScope(pools.app, ann.id, (tx) => createOwnedLibrary(tx, "Ann's Apple ID"))).id;
});

afterAll(async () => pools.close());

describe("sync runs", () => {
  it("allow one running run per library and finish only a running one", async () => {
    const ids = await newRun();
    await expect(newRun()).rejects.toMatchObject({ code: "sync-already-running" });
    await asAnn((tx) => recordSyncProgress(tx, ids, "albums", "songs", 3));
    expect(await asAnn((tx) => finishSyncRun(tx, ids, { status: "failed", errorCode: "apple-music-unavailable" }, noChanges))).toBe(true);
    expect(await asAnn((tx) => finishSyncRun(tx, ids, succeeded, noChanges))).toBe(false);
    const row = await asAnn((tx) => syncRunOf(tx, ids));
    expect(row).toMatchObject({ status: "failed", phase: "albums", songs: 3, errorCode: "apple-music-unavailable" });
    expect(row?.finishedAt).toBeInstanceOf(Date);
    expect((await asAnn((tx) => latestSyncRun(tx, libraryId)))?.id).toBe(ids.runId);
  });

  it("are marked interrupted at start when a server stopped without finishing them", async () => {
    const ids = await newRun();
    expect(await interruptRunningSyncRuns(testConfig().database.adminUrl)).toBe(1);
    expect(await asAnn((tx) => syncRunOf(tx, ids))).toMatchObject({ status: "interrupted" });
  });

  it("are invisible and unwritable outside the library", async () => {
    const outsider = { userId: bob.id, libraryId };
    expect(await runInLibrary(pools.app, outsider, (tx) => latestSyncRun(tx, libraryId))).toBeNull();
    await expect(runInLibrary(pools.app, outsider, (tx) => startSyncRun(tx, libraryId, bob.id, false))).rejects.toThrow();
  });
});

describe("the mirror", () => {
  it("records added, changed, re-seen and removed items by value", async () => {
    const first = await runOver([song("i.1", "Harbor Lights", "2001"), song("i.2", "Low Tide"), song("i.3", "Gone Soon")]);
    expect(await asAnn((tx) => runChangeCountsOf(tx, first))).toEqual({ added: 3, changed: 0, removed: 0, reseen: 0 });
    const second = await runOver([song("i.1", "Harbor Lights", "2001"), song("i.2", "Low Tide (Remastered)"), song("i.4", "New Song", "2004")]);
    expect(await asAnn((tx) => runChangeCountsOf(tx, second))).toEqual({ added: 1, changed: 1, removed: 1, reseen: 2 });
    expect(await asAnn((tx) => storedItemCount(tx, libraryId))).toBe(3);
    expect(await asAnn((tx) => catalogIdsSeenIn(tx, second, "song"))).toEqual(["2001", "2004"]);
    const third = await runOver([song("i.1", "Harbor Lights", "2001"), song("i.2", "Low Tide (Remastered)"), song("i.3", "Gone Soon"), song("i.4", "New Song", "2004")]);
    expect(await asAnn((tx) => runChangeCountsOf(tx, third))).toEqual({ added: 0, changed: 1, removed: 0, reseen: 4 });
  });

  it("forgets the items a stopped run added and keeps the rest", async () => {
    const ids = await newRun();
    await asAnn((tx) => upsertLibraryItems(tx, ids, "song", [song("i.other1", "Someone Else's Song")]));
    await asAnn((tx) => forgetItemsFirstSeenIn(tx, ids));
    await asAnn((tx) => finishSyncRun(tx, ids, { status: "needs-confirmation", errorCode: null }, noChanges));
    expect(await asAnn((tx) => storedItemCount(tx, libraryId))).toBe(4);
  });

  it("replaces catalog items fetched again", async () => {
    const ids = await newRun();
    await asAnn((tx) => upsertCatalogItems(tx, ids, "us", "song", [song("2001", "Harbor Lights")]));
    await asAnn((tx) => upsertCatalogItems(tx, ids, "us", "song", [{ ...song("2001", "Harbor Lights"), attributes: { name: "Harbor Lights", isrc: "USAAA2600001" } }]));
    await asAnn((tx) => finishSyncRun(tx, ids, succeeded, noChanges));
    const rows = await asAnn((tx) => tx.execute(sql`select attributes from apple_catalog_item where catalog_id = '2001'`));
    expect(rows.rows).toEqual([{ attributes: { name: "Harbor Lights", isrc: "USAAA2600001" } }]);
  });
});
