// A column of the outer query, named with its table. Drizzle leaves table names off the
// columns in the select list of a single-table query, so a correlated subquery there would
// otherwise bind them to its own tables: edition.id in place of album.id, for one.
import { getTableName, sql, type Column, type SQL } from "drizzle-orm";

export function outerColumn(column: Column): SQL {
  return sql`${sql.identifier(getTableName(column.table))}.${sql.identifier(column.name)}`;
}
