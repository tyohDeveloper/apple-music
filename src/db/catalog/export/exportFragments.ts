// SQL the export reads share: instants as UTC RFC 3339 text, and the rows an entity owns
// gathered into JSON arrays in their stored order by correlated subqueries on the owner's
// alias, so each entity type is read in one query rather than one query per entity.
import { sql, type SQL } from "drizzle-orm";
import type { CreditSource } from "../credits/creditQueries.ts";
import type { GenreSource } from "../genres/genreAssignments.ts";
import type { ExternalIdSource } from "../identifiers/externalIds.ts";

export function instantText(instant: SQL): SQL {
  return sql`to_char(${instant} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;
}

// The owner's columns, under the alias its query gives it.
function ownerColumn(alias: string, column: string): SQL {
  return sql`${sql.identifier(alias)}.${sql.identifier(column)}`;
}

function ownedBy(table: string, owner: string, alias: string): SQL {
  return sql`${sql.identifier(table)} owned where owned.library_id = ${ownerColumn(alias, "library_id")}
    and owned.${sql.identifier(owner)} = ${ownerColumn(alias, "id")}`;
}

export function genreIdsJson(source: GenreSource, alias: string): SQL {
  return sql`coalesce((select json_agg(owned.genre_id order by owned.position) from ${ownedBy(source.table, source.owner, alias)}), '[]'::json)`;
}

export function externalIdsJson(source: ExternalIdSource, alias: string): SQL {
  return sql`coalesce((select json_agg(json_build_object('namespace', owned.namespace, 'value', owned.value)
    order by owned.namespace, owned.value) from ${ownedBy(source.table, source.owner, alias)}), '[]'::json)`;
}

export function creditsJson(source: CreditSource, alias: string): SQL {
  return sql`coalesce((select json_agg(json_build_object('performerId', owned.performer_id, 'creditedNameId', owned.credited_name_id,
    'role', owned.role, 'joinPhrase', owned.join_phrase, 'instruments', owned.instruments) order by owned.position)
    from ${ownedBy(source.table, source.owner, alias)}), '[]'::json)`;
}
