// Column builders shared by the catalog tables: timestamps, the library column every row
// carries (ADR-0003) and the partial_date domain (ADR-0009).
import { customType, timestamp, uuid } from "drizzle-orm/pg-core";
import { library } from "./libraryTables.ts";

export const instant = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const libraryIdColumn = () =>
  uuid("library_id")
    .notNull()
    .references(() => library.id, { onDelete: "cascade" });

export const partialDate = customType<{ data: string; driverData: string }>({ dataType: () => "partial_date" });
