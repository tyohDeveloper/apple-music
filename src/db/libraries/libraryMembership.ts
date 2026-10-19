// Libraries visible to the user named by the transaction scope, and library creation
// through app_create_library(), which also records the creator as owner.
import { eq, sql } from "drizzle-orm";
import { library, libraryMember } from "../schema/libraryTables.ts";
import type { ScopedTransaction } from "../withUserScope.ts";

export type MemberLibrary = {
  readonly id: string;
  readonly label: string;
  readonly storefront: string | null;
  readonly role: string;
};

export function listMemberLibraries(tx: ScopedTransaction): Promise<MemberLibrary[]> {
  return tx
    .select({ id: library.id, label: library.label, storefront: library.storefront, role: libraryMember.role })
    .from(library)
    .innerJoin(libraryMember, eq(libraryMember.libraryId, library.id))
    .orderBy(library.label);
}

export async function createOwnedLibrary(tx: ScopedTransaction, label: string): Promise<MemberLibrary> {
  const created = await tx.execute<{ id: string }>(sql`select app_create_library(${label}) as id`);
  const id = created.rows[0]?.id;
  if (id === undefined) throw new Error("app_create_library returned no id");
  return { id, label, storefront: null, role: "owner" };
}
