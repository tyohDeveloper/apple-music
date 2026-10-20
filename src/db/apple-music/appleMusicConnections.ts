// A library's Apple Music connection, read and written inside the library's scope
// (docs/design/apple-music-import.md, slice G). Row-level security lets members read it and
// only the owner write it; routes also check the member's role, so others are refused plainly.
import { eq, sql } from "drizzle-orm";
import { appleMusicConnection } from "../schema/appleMusicTables.ts";
import { library, libraryMember } from "../schema/libraryTables.ts";
import type { ScopedTransaction } from "../withUserScope.ts";

export type StoredConnection = { readonly sealedToken: string; readonly connectedAt: Date; readonly storefront: string | null };
export type NewConnection = { readonly libraryId: string; readonly userId: string; readonly sealedToken: string; readonly storefront: string };

// The signed-in user's role in the library, or null for a library they are not a member of.
export async function memberRoleOf(tx: ScopedTransaction, libraryId: string): Promise<string | null> {
  const [row] = await tx.select({ role: libraryMember.role }).from(libraryMember).where(eq(libraryMember.libraryId, libraryId));
  return row?.role ?? null;
}

export async function connectionOf(tx: ScopedTransaction, libraryId: string): Promise<StoredConnection | null> {
  const [row] = await tx
    .select({ sealedToken: appleMusicConnection.sealedToken, connectedAt: appleMusicConnection.connectedAt, storefront: library.storefront })
    .from(appleMusicConnection)
    .innerJoin(library, eq(library.id, appleMusicConnection.libraryId))
    .where(eq(appleMusicConnection.libraryId, libraryId));
  return row ?? null;
}

// Connects or reconnects the library, and records the storefront Apple reported for it.
export async function saveConnection(tx: ScopedTransaction, connection: NewConnection): Promise<void> {
  const { libraryId, userId, sealedToken, storefront } = connection;
  await tx
    .insert(appleMusicConnection)
    .values({ libraryId, sealedToken, connectedBy: userId })
    .onConflictDoUpdate({ target: appleMusicConnection.libraryId, set: { sealedToken, connectedBy: userId, connectedAt: sql`now()` } });
  await tx.update(library).set({ storefront, updatedAt: sql`now()` }).where(eq(library.id, libraryId));
}

export async function removeConnection(tx: ScopedTransaction, libraryId: string): Promise<boolean> {
  const removed = await tx.delete(appleMusicConnection).where(eq(appleMusicConnection.libraryId, libraryId)).returning({ libraryId: appleMusicConnection.libraryId });
  return removed.length > 0;
}
