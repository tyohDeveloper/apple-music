// Row-level security and role separation (ADR-0003, docs/ARCHITECTURE.md).
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DatabasePools } from "../../src/db/createDatabasePools.ts";
import { createOwnedLibrary, listMemberLibraries } from "../../src/db/libraries/libraryMembership.ts";
import { withLibraryScope } from "../../src/db/withLibraryScope.ts";
import { withUserScope } from "../../src/db/withUserScope.ts";
import { createTestUser, openTestPools, queryAsRole, testConfig } from "./support/testServices.ts";

let pools: DatabasePools;
let ann: { id: string };
let bob: { id: string };
let annLibraryId: string;

beforeAll(async () => {
  pools = openTestPools();
  ann = await createTestUser(pools, "ann");
  bob = await createTestUser(pools, "bob");
  annLibraryId = (await withUserScope(pools.app, ann.id, (tx) => createOwnedLibrary(tx, "Ann's Apple ID"))).id;
});

afterAll(async () => pools.close());

describe("library isolation", () => {
  it("lists a library only for its members", async () => {
    expect((await withUserScope(pools.app, ann.id, listMemberLibraries)).map((l) => l.id)).toContain(annLibraryId);
    expect(await withUserScope(pools.app, bob.id, listMemberLibraries)).toEqual([]);
  });

  it("gives a non-member no current library even when the library id is set", async () => {
    const scope = { userId: bob.id, libraryId: annLibraryId };
    const current = await withLibraryScope(pools.app, scope, (tx) => tx.execute(sql`select app_current_library() as id`));
    expect(current.rows[0]).toEqual({ id: null });
  });

  it("refuses direct inserts into library from the application role", async () => {
    const insert = withUserScope(pools.app, ann.id, (tx) => tx.execute(sql`insert into library (label) values ('x')`));
    await expect(insert).rejects.toThrow();
  });

  it("refuses library creation without a signed-in user", async () => {
    await expect(pools.app.execute(sql`select app_create_library('orphan')`)).rejects.toThrow();
  });

  it("keeps the application role out of the auth schema and the auth role out of library data", async () => {
    const { appUrl, authUrl } = testConfig().database;
    await expect(queryAsRole(appUrl, 'select count(*) from auth."user"')).rejects.toThrow(/permission denied/);
    await expect(queryAsRole(authUrl, "select count(*) from public.library")).rejects.toThrow(/permission denied/);
  });
});
