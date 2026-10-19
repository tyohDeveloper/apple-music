// Row-level security for a catalog table (ADR-0003, ADR-0009): members read the scoped
// library's rows; owners and editors insert, update and delete them.
import { sql } from "drizzle-orm";
import { pgPolicy } from "drizzle-orm/pg-core";
import { appRole } from "./libraryTables.ts";

const readable = sql`library_id = app_current_library()`;
const editable = sql`library_id = app_current_editable_library()`;

export function libraryRowPolicies(table: string) {
  return [
    pgPolicy(`${table}_read`, { for: "select", to: appRole, using: readable }),
    pgPolicy(`${table}_insert`, { for: "insert", to: appRole, withCheck: editable }),
    pgPolicy(`${table}_update`, { for: "update", to: appRole, using: editable, withCheck: editable }),
    pgPolicy(`${table}_delete`, { for: "delete", to: appRole, using: editable }),
  ];
}
