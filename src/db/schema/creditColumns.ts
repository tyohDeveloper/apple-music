// The columns every ordered credit carries, for recordings and albums alike (DOMAIN-MODEL.md,
// Credits): a position, the credited performer, which of its names was printed, the role,
// the join phrase and any instruments.
import { sql } from "drizzle-orm";
import { integer, text, uuid } from "drizzle-orm/pg-core";

export const creditColumns = () => ({
  position: integer("position").notNull(),
  performerId: uuid("performer_id").notNull(),
  creditedNameId: uuid("credited_name_id"),
  role: text("role").notNull(),
  joinPhrase: text("join_phrase"),
  instruments: text("instruments").array().notNull().default(sql`'{}'::text[]`),
});
