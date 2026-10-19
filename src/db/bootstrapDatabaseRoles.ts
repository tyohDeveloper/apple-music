// Creates or updates the login roles for one environment. Run once per environment
// with the owner connection (`npm run db:bootstrap`); migrations grant privileges.
import pg from "pg";

export type RoleCredential = { readonly name: string; readonly password: string };

async function formatStatement(client: pg.Client, template: string, ...values: string[]): Promise<string> {
  const placeholders = values.map((_, index) => `$${index + 2}::text`).join(", ");
  const result = await client.query<{ sql: string }>(`select format($1, ${placeholders}) as sql`, [template, ...values]);
  const statement = result.rows[0]?.sql;
  if (statement === undefined) throw new Error("format() returned no statement");
  return statement;
}

async function ensureLoginRole(client: pg.Client, role: RoleCredential): Promise<void> {
  const existing = await client.query("select 1 from pg_roles where rolname = $1", [role.name]);
  const verb = existing.rowCount === 0 ? "CREATE" : "ALTER";
  await client.query(await formatStatement(client, `${verb} ROLE %I LOGIN PASSWORD %L`, role.name, role.password));
  const database = await client.query<{ name: string }>("select current_database() as name");
  const grant = await formatStatement(client, "GRANT CONNECT ON DATABASE %I TO %I", database.rows[0]?.name ?? "", role.name);
  await client.query(grant);
}

export async function bootstrapDatabaseRoles(adminUrl: string, roles: readonly RoleCredential[]): Promise<void> {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    for (const role of roles) await ensureLoginRole(client, role);
  } finally {
    await client.end();
  }
}
