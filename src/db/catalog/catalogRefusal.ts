// Refusals that catalog work expects, translated from Postgres errors so a route answers
// with a status and a code instead of a 500 (ADR-0009). SQLSTATE values are Postgres's.
export type RefusalCode =
  | "not-found"
  | "forbidden"
  | "validation"
  | "conflict-in-use"
  | "conflict-duplicate"
  | "conflict-preferred-name";

export class CatalogRefusal extends Error {
  readonly code: RefusalCode;

  constructor(code: RefusalCode) {
    super(code);
    this.name = "CatalogRefusal";
    this.code = code;
  }
}

type PostgresError = { readonly code: string; readonly constraint?: unknown };

const bySqlState: Readonly<Record<string, RefusalCode>> = {
  "23505": "conflict-duplicate",
  "23514": "validation",
  "23502": "validation",
  "22P02": "validation",
  "22001": "validation",
  "42501": "forbidden",
};
const byConstraint: Readonly<Record<string, RefusalCode>> = {
  performer_has_one_preferred_name: "conflict-preferred-name",
  performer_relation_not_self: "validation",
};

function postgresErrorOf(error: unknown): PostgresError | null {
  for (let current = error, depth = 0; depth < 4; depth += 1) {
    if (typeof current !== "object" || current === null) return null;
    if ("code" in current && typeof current.code === "string" && current.code.length === 5) return current as PostgresError;
    current = "cause" in current ? current.cause : null;
  }
  return null;
}

// foreignKey: what a foreign-key violation means here, "not-found" for a write that names a
// missing row, "conflict-in-use" for a delete of a row something still references.
export function refusalOf(error: unknown, foreignKey: RefusalCode): CatalogRefusal | null {
  if (error instanceof CatalogRefusal) return error;
  const found = postgresErrorOf(error);
  if (found === null) return null;
  const constraint = typeof found.constraint === "string" ? byConstraint[found.constraint] : undefined;
  const code = constraint ?? (found.code === "23503" ? foreignKey : bySqlState[found.code]);
  return code === undefined ? null : new CatalogRefusal(code);
}

export function requireFound<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new CatalogRefusal("not-found");
  return value;
}
