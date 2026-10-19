# Agent contract

Instructions for any coding agent working in this repository.

## Read first, in this order

1. [README.md](README.md)
2. [docs/PLAN.md](docs/PLAN.md) — requirements, decisions, the active phase, open questions
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — role and path mapping, boundaries, contracts
4. [docs/CODING-STANDARDS.md](docs/CODING-STANDARDS.md) — the adopted standards release, enforcement matrix and local interpretations; the policy text is [docs/standards/portable-v2.2.md](docs/standards/portable-v2.2.md)
5. [docs/DOMAIN-MODEL.md](docs/DOMAIN-MODEL.md)
6. [docs/adr/](docs/adr/), [.architecture-exceptions.json](.architecture-exceptions.json), `.architecture-bindings.json`, [datastore-ownership.json](datastore-ownership.json)

Inspect the code before choosing tools or patterns; do not import conventions from other repositories.

## Commands

Available from Phase 1.

| Command | Purpose |
|---|---|
| `npm ci` | Install exactly what `package-lock.json` pins |
| `npm run dev` | Server and client with reload against the development database |
| `npm run build` | Typecheck, standards check, unit tests, integration tests, bundle, artifact verification; stops at the first failure |
| `npm run test:e2e` | End-to-end suite against the built server and the Apple Music fake |
| `npm run db:bootstrap` | Create the database roles for an environment (once, with the owner connection) |
| `npm run db:generate -- --name <description>` | Generate a migration from schema changes |
| `npm run seed` | Create the owner account and an empty library |

## Rules that are easy to break

- Domain computation lives in PURE files, one exported function per file, named for the function, each with a unit test. Views compute nothing; controllers sequence and never calculate.
- Every function body is at most 20 lines; file limits are per role.
- No shape names (`utils`, `helpers`, `types`, `index` and the rest of §3.8), no barrels, no re-exports.
- Every user-visible string comes from `data/locales/`; every interactive element has a `data-testid` following §4.
- Only MODEL (`src/db/**`) imports `pg` or `drizzle-orm`; only REMOTE uses `fetch`; only `src/server/config/**` reads `process.env`.
- Every library table has `library_id`, composite foreign keys and the row-level-security policy; a new table without them fails the integration tests.
- Migrations are generated, never edited after they reach `main`, one per commit.
- Curated data is never overwritten by an import. Nothing is written to Apple Music except through an approved `apple_change`.

## Do not change silently

Standards versions, the policy copy, data meanings, mandated bindings, datastore ownership, exceptions, or applied migrations. Propose such a change with an ADR or an exception entry. A review is not authorization to remediate.

## Commits

Terse subject lines; decompose large changes into small commits. Author email `50533494+tyohDeveloper@users.noreply.github.com`. Checkpoint a plan in `docs/PLAN.md` before a large build phase, and update the active phase when it ends.
