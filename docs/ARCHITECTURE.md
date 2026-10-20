# Architecture

## Adopted standards and scope

- **Policy:** Engineering Standards v2.2, portable edition, pinned in [CODING-STANDARDS.md](CODING-STANDARDS.md) ([ADR-0001](adr/0001-adopt-engineering-standards.md)).
- **Target profile:** hosted Postgres — a Node server with a Postgres datastore and a single-page web client served by the same server. The standalone-HTML5 and artifact-contract profiles do not apply. The native-wrappers profile applies only when a native target is added (Phase 8+).
- **Scope:** the whole repository. The role mapping below is binding and checked by `npm run check:standards`.

## Role and path mapping

Paths are relative to the repository root. A file outside every row fails the standards check.

| Role | Paths | Owns |
|---|---|---|
| VIEW | `src/browser/views/**/*.tsx`, `src/browser/main.tsx`, `src/browser/index.html`, `src/browser/styles/**/*.css` | Preact components, the page shell and styles: render state, call controller-supplied callbacks |
| CONTROLLER | `src/server/**`, `src/browser/controllers/**` | Server composition, HTTP routes, request scope, background sync runner; browser hooks, effects and mount-point lookup |
| STATE | `src/browser/state/**` | Reducers, action creators, selectors for the browser |
| PURE-CORE | `src/credits/**`, `src/names/**`, `src/editions/**` | Credit parsing, name normalization and sort forms, edition grouping and track classification |
| PURE | `src/library-sync/**`, `src/partial-dates/**`, `src/localization/**`, `src/taxonomies/**`, `src/routing/**`, `src/metrics/**`, `src/forms/**`, `src/contracts/**`, `src/identifiers/**` | Import planning, partial dates, message resolution, taxonomy lookups, client route parsing, metric arithmetic, form-to-request mapping, HTTP wire schemas, external identifier formats |
| DATA | `data/**` | Taxonomies, classification markers, locale strings, security policy, JSON Schemas |
| PLATFORM-PURE | Files listed in `platform-pure-allowlist.json` | Deterministic mandated primitives: content hashing, password verification |
| PLATFORM-AMBIENT | `src/platform/**` not on the allowlist | Clock, password hashing, token encryption, developer-token signing |
| MODEL | `src/db/**`, `drizzle/**` | The datastore this application owns: schema, migrations, pools, library scope, repositories |
| REMOTE | `src/apple-music/**`, `src/browser/server-api/**` | Apple Music API access; the browser's access to this server's HTTP API |
| BUILD | `scripts/**`, `*.config.ts` | Standards checker, verifiers, release and wiki tooling, tool configuration |
| TEST | `tests/**` | Unit, integration and end-to-end tests, fakes and fixtures |

The same mapping, with import rules, is kept machine-readable in [architecture.json](../architecture.json); `npm run check:standards` fails if the two disagree. Root-level manifests and documents (`README.md`, `package.json`, `tsconfig*.json`, the `.architecture-*` manifests) are outside the role model.

`src/contracts/**` files each export one TypeBox schema constant and its static type, or types only; the server validates with the schemas and the browser imports types only, so no schema code ships to the browser.

## Dependency direction

```
VIEW → CONTROLLER → STATE → PURE-CORE / PURE → DATA
                 ↘ MODEL, REMOTE, PLATFORM-AMBIENT
PURE → PLATFORM-PURE
```

A role imports only roles to its right or below it. Library imports are restricted by role:

| Import | Allowed in |
|---|---|
| `pg`, `drizzle-orm` | MODEL |
| `better-auth` | `src/server/auth/**` |
| `fastify`, `@fastify/*` | Server CONTROLLER |
| `preact` | VIEW and browser CONTROLLER |
| `typebox` | `src/contracts/**` and server CONTROLLER |
| `argon2`, `jose`, `node:crypto` | PLATFORM |
| The `fetch` global | REMOTE |
| `process.env` | `src/server/config/**` |

## Boundaries

### Datastore

Postgres is the system of record ([ADR-0002](adr/0002-postgres-system-of-record.md)). Ownership is declared in [datastore-ownership.json](../datastore-ownership.json): this repository is the sole schema owner and writer, so the role is MODEL. Three database roles separate duties:

| Role | Used by | Privileges |
|---|---|---|
| `apple_music_owner` | Migrations and administrative scripts | Owns the schemas; bypasses row-level security |
| `apple_music_app` | Request handling and sync | Data access to library tables; row-level security enforced |
| `apple_music_auth` | Better Auth only | Data access to the `auth` schema only |

Every library table has row-level security with the policy `library_id = app_current_library()`. `app_current_library()` returns the library named by the transaction setting `app.library_id` only when the user named by `app.user_id` is a member of it, so a handler that forgets an authorization check still reads nothing ([ADR-0003](adr/0003-library-partitioning-and-isolation.md)). Migrations live in `drizzle/`, carry timestamp prefixes, are never edited once applied, and run before the server accepts traffic.

### Apple Music

Apple owns the Apple Music library; this application consumes it through Apple's published API, so the role is REMOTE ([ADR-0005](adr/0005-apple-music-integration-boundary.md)).

- MusicKit on the Web runs in the browser only to obtain the Music User Token after the user authorizes. It is loaded from Apple's CDN on the connection screen.
- The server signs the developer token (ES256) and calls the Apple Music API with both tokens. The Music User Token is stored encrypted (AES-256-GCM) with a key version.
- Writes to Apple Music are planned as `apple_change` rows and executed only after approval. The port never promises atomicity across the boundary: a change that fails is recorded as failed and is not retried automatically.

### HTTP API

`/api/**` is JSON over HTTPS and is the only contract a client depends on, which keeps future native clients possible without server changes. Request bodies, parameters and responses are validated against `src/contracts/**`. `/health` checks the database; `/metrics` reports request and sync counters.

### Browser

The browser holds no authority: every authorization decision is made on the server. The Content-Security-Policy allows scripts from `'self'` and `https://js-cdn.music.apple.com`, connections to `'self'` and Apple's MusicKit hosts, and images from `'self'` and Apple's artwork CDN.

## Import pipeline

```
REMOTE fetch pages ─▶ PURE plan mirror changes ─▶ MODEL upsert mirror
                         │
REMOTE fetch catalog ◀───┘
        │
        ▼
PURE plan catalog import (credits, editions, recordings, classification) ─▶ MODEL apply in batches ─▶ sync_run counts
```

A sync run is a background job started by a request; no HTTP handler holds a long transaction. If a reauthorized connection returns a library with no overlap with the stored one, the run stops in `needs-confirmation` instead of recording removals.

## Checks

| Command | Enforces |
|---|---|
| `npm run typecheck` | TypeScript strict mode across server, client, scripts and tests |
| `npm run check:standards` | Role mapping coverage, import direction and library restrictions, ambient identifiers, function and file limits, one export per PURE file, shape names, barrels, test identifiers, user-visible literals, locale keys, data schemas, unit-test coverage of PURE exports and reducer actions, exception expiry, license and attributions, datastore ownership |
| `npm run check:dead-code` | Unused files, exports and dependencies (Knip) |
| `npm run check:migrations` | Migration names, rollback blocks, journal consistency, immutability of applied migrations, one migration per commit |
| `npm run test:unit` | PURE and STATE tests, and planted-violation controls for the standards checker |
| `npm run test:integration` | MODEL repositories, migrations, row-level security and HTTP routes against Postgres |
| `npm run bundle` | Client and server builds |
| `npm run check:bindings` | Mandated bindings resolved in the installed tree and the built server |
| `npm run verify:build` | Built artifact: gzip baseline, test identifier uniqueness and retention, CSP, no inline script, absence of secrets |
| `npm run test:e2e` | User flows in a browser against the built server (and, from Phase 3, an Apple Music fake) |

`npm run build` runs all but the last in order and stops at the first failure; the end-to-end suite is a separate gate in CI.
