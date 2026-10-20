// Reads of performers (DOMAIN-MODEL.md): search by any of their names, optionally only the
// performers carrying one genre, and one performer with its names, its relations in both
// directions and its genres. Row-level security limits every query to the scoped library.
import { and, asc, count, desc, eq, or, sql, type SQL } from "drizzle-orm";
import { alias, type AnyPgColumn } from "drizzle-orm/pg-core";
import { matchKeyOf } from "../../../names/matchKeyOf.ts";
import { performer, performerName, performerRelation } from "../../schema/performerTables.ts";
import type { ScopedTransaction } from "../../withUserScope.ts";
import type { CatalogPage, PageRequest } from "../catalogPage.ts";
import { carriesGenre, genresOf, performerGenres, type GenreReference } from "../genres/genreAssignments.ts";

export type PerformerSummary = {
  readonly id: string;
  readonly kind: string;
  readonly name: string;
  readonly sortName: string;
  readonly disambiguation: string | null;
};
type PerformerReference = { readonly id: string; readonly name: string };
type PerformerNameRow = {
  readonly id: string;
  readonly name: string;
  readonly sortName: string;
  readonly kind: string;
  readonly locale: string | null;
  readonly validFrom: string | null;
  readonly validTo: string | null;
  readonly isPreferred: boolean;
};
type PerformerRelationRow = {
  readonly id: string;
  readonly kind: string;
  readonly subject: PerformerReference;
  readonly object: PerformerReference;
  readonly roles: string[];
  readonly began: string | null;
  readonly ended: string | null;
  readonly notes: string | null;
};
export type PerformerDetail = Omit<PerformerSummary, "name" | "sortName"> & {
  readonly began: string | null;
  readonly ended: string | null;
  readonly area: string | null;
  readonly notes: string | null;
  readonly names: PerformerNameRow[];
  readonly relations: PerformerRelationRow[];
  readonly genres: GenreReference[];
};

const preferredName = and(
  eq(performerName.libraryId, performer.libraryId),
  eq(performerName.performerId, performer.id),
  eq(performerName.isPreferred, true),
);
const subjectName = alias(performerName, "subject_name");
const objectName = alias(performerName, "object_name");

function anyNameMatches(query: string): SQL | undefined {
  const key = matchKeyOf(query);
  if (key === "") return undefined;
  return sql`exists (select 1 from performer_name n where n.library_id = ${performer.libraryId}
    and n.performer_id = ${performer.id} and n.match_key like ${`%${key}%`})`;
}

export async function listPerformers(tx: ScopedTransaction, page: PageRequest, genreId?: string): Promise<CatalogPage<PerformerSummary>> {
  const matches = and(anyNameMatches(page.query), carriesGenre(performerGenres, performer.id, genreId));
  const items = await tx
    .select({ id: performer.id, kind: performer.kind, name: performerName.name, sortName: performerName.sortName, disambiguation: performer.disambiguation })
    .from(performer)
    .innerJoin(performerName, preferredName)
    .where(matches)
    .orderBy(asc(performerName.sortName), asc(performer.id))
    .limit(page.limit)
    .offset(page.offset);
  const [counted] = await tx.select({ total: count() }).from(performer).where(matches);
  return { items, total: counted?.total ?? 0 };
}

function namesOf(tx: ScopedTransaction, performerId: string): Promise<PerformerNameRow[]> {
  const { id, name, sortName, kind, locale, validFrom, validTo, isPreferred } = performerName;
  return tx
    .select({ id, name, sortName, kind, locale, validFrom, validTo, isPreferred })
    .from(performerName)
    .where(eq(performerName.performerId, performerId))
    .orderBy(desc(isPreferred), asc(sortName), asc(id));
}

type NameColumns = { readonly libraryId: AnyPgColumn; readonly performerId: AnyPgColumn; readonly isPreferred: AnyPgColumn };

function preferredNameOf(name: NameColumns, performerId: AnyPgColumn): SQL | undefined {
  return and(eq(name.libraryId, performerRelation.libraryId), eq(name.performerId, performerId), eq(name.isPreferred, true));
}

async function relationsOf(tx: ScopedTransaction, performerId: string): Promise<PerformerRelationRow[]> {
  const { id, kind, subjectId, objectId, roles, began, ended, notes } = performerRelation;
  const rows = await tx
    .select({ id, kind, subjectId, subjectName: subjectName.name, objectId, objectName: objectName.name, roles, began, ended, notes })
    .from(performerRelation)
    .innerJoin(subjectName, preferredNameOf(subjectName, subjectId))
    .innerJoin(objectName, preferredNameOf(objectName, objectId))
    .where(or(eq(subjectId, performerId), eq(objectId, performerId)))
    .orderBy(asc(kind), asc(subjectName.sortName), asc(objectName.sortName));
  return rows.map(({ subjectId: subject, subjectName: subjectText, objectId: object, objectName: objectText, ...rest }) => ({
    ...rest,
    subject: { id: subject, name: subjectText },
    object: { id: object, name: objectText },
  }));
}

export async function getPerformerDetail(tx: ScopedTransaction, performerId: string): Promise<PerformerDetail | null> {
  const { id, kind, began, ended, area, disambiguation, notes } = performer;
  const [row] = await tx.select({ id, kind, began, ended, area, disambiguation, notes }).from(performer).where(eq(id, performerId));
  if (row === undefined) return null;
  const names = await namesOf(tx, performerId);
  return { ...row, names, relations: await relationsOf(tx, performerId), genres: await genresOf(tx, performerGenres, performerId) };
}
