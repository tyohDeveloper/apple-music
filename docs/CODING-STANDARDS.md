# Adopted coding standards

## Adopted release

> **Source of truth.** `tyohDeveloper/engineering-standards`, release `1.0.1.0` (tag `standards-1.0.1.0`, commit `bb876dd97747e1940aa41ea480eac85044b737aa`). If this copy and the tagged release disagree, the release wins. Do not amend this file to propose a standards change; open a proposal in the hub.

| Item | Value |
|---|---|
| Policy | Engineering Standards release 1.0.1.0 (hub-authored; supersedes the v2.2 portable edition adopted 2026-10-19) |
| Source | [tyohDeveloper/engineering-standards](https://github.com/tyohDeveloper/engineering-standards) at tag `standards-1.0.1.0`, commit `bb876dd97747e1940aa41ea480eac85044b737aa` |
| Policy text | Retrieved from the hub at that tag (retrieval step below). The v2.2 copy stays at [standards/portable-v2.2.md](standards/portable-v2.2.md) as the superseded predecessor; its wiki-authority clause is void (hub ADR-0004) |
| Adoption record | [STANDARDS-ADOPTION.json](../STANDARDS-ADOPTION.json), schema 2 |
| Approval | Owner, 2026-10-30; [ADR-0010](adr/0010-readopt-at-release-1.0.1.0.md) |
| Decision records | [ADR-0001](adr/0001-adopt-engineering-standards.md) (v2.2 adoption), [ADR-0010](adr/0010-readopt-at-release-1.0.1.0.md) (this release) |

### Retrieval step

| Hub document | Governs here |
|---|---|
| `standards/coding-core.md` | Core rules C-1 to C-49; language classes `application` (TypeScript) and `schema` (SQL) |
| `standards/bindings/typescript.md`, `standards/bindings/sql.md` | How each rule is checked; TS-1 to TS-7 |
| `standards/profiles.md` | Delivery profile rules: §2.5 hosted-durable, §3.2 store, §3.3 identity and scoping, §3.6 ports, §3.7 localization |
| `standards/architecture.md` | Role model |
| `reviews/` | Review procedures |

### Delivery profile

`state = hosted-durable`, `packaging = hosted-web`, `store = sql+json+blob`, `identity = authenticated` (Better Auth, owner account seeded, sign-up closed; [ADR-0008](adr/0008-access-model.md)), `network = required`, `compute = interactive`; localization `scope = [language]`, `mode = dynamic`, domains `interface` and `display-names`, locale `en`. Ports: `Store` (Postgres via Drizzle, default), `Secrets` (environment, recorded substitution), `Jobs` (in-process background sync, recorded substitution), `Identity` (default), `Files` (default). Bindings `typescript:application`, `sql:schema`.

The companion wiki pages summarised in [standards/hosted-postgres-profile.md](standards/hosted-postgres-profile.md) were exported verbatim into the hub and reconciled there; their rules now appear as profiles §2.5, §3.6 and the SQL binding. That file is retained as the rule-by-rule compliance statement.

### Core rule mapping

The enforcement matrix below keeps the v2.2 section numbering that `check:standards` emits. Correspondence to 1.0.1.0 core rules:

| v2.2 section | Core rule |
|---|---|
| §1 roles, import direction, purity, PLATFORM allowlist, datastore ownership | C-1, C-2, C-3, C-4, C-25 |
| §1.6, §3.5 single sourcing | C-5 |
| §2 state | C-7, C-8, C-9 |
| §3.1–§3.4 limits | C-11, C-12, C-13 |
| §3.2, §3.8, §3.9 one export, names, barrels | C-6, TS-7 |
| §3.6 dead code | C-20 |
| §3.7, §11 exceptions | C-27 |
| §4 test identifiers | C-18 |
| §5 data | C-14, C-15, C-45–C-49 |
| §6 indexing | C-16a |
| §7 gating, §7.6 size | C-19, C-21 |
| §8 tests | C-22, C-23 |
| §9 libraries | C-24 |
| §10 license | C-26 |
| §15 localization | C-32–C-43 |
| §18 bindings | C-25 |
| Hosted profile | profiles §2.5; SQL binding |
| New in 1.0.x without a v2.2 counterpart | C-10 (EXC-0002), C-30 (met: `src/contracts/**` is the one schema source for the HTTP boundary; Drizzle schema for SQL), C-31 (EXC-0003), CI runner pinning under C-19 (done) |

## Application mapping

Role and path mapping, dependency direction, boundaries and contracts: [ARCHITECTURE.md](ARCHITECTURE.md). Datastore ownership: [datastore-ownership.json](../datastore-ownership.json).

## Enforcement matrix

`npm run build` runs typecheck, standards check, dead-code check, migrations check, unit tests, integration tests, bundle, bindings check and artifact verification in that order; CI runs the same build and then the end-to-end suite as a separate job.

| Requirement | Command | Enforcement |
|---|---|---|
| §1 layer roles, import direction, library restrictions | `npm run check:standards` | automated |
| §1.3, §1.4 purity of STATE and PURE: ambient identifiers, DOM, IO | `npm run check:standards` | automated |
| §1.5, §5 data externalized and schema-validated | `npm run check:standards` | automated |
| §1.6, §3.5 single-sourced computation, no duplication | — | manual-review |
| §1.8 PLATFORM-PURE allowlist; PLATFORM-AMBIENT from CONTROLLER only | `npm run check:standards` | automated |
| §1.9 datastore ownership declared for every MODEL path | `npm run check:standards` | automated |
| §1.9 MODEL and REMOTE behind one port per concern | — | manual-review |
| §2 mutable state discipline | — | manual-review |
| §3.1 function length ≤ 20 lines; §3.4 VIEW markup ≤ 80 lines | `npm run check:standards` | automated |
| §3.2 one export per PURE file, filename matches | `npm run check:standards` | automated |
| §3.3 file length by role | `npm run check:standards` | automated |
| §3.6 no dead code: files, exports, dependencies, locale keys | `npm run check:dead-code`, `npm run check:standards` | automated |
| §3.7, §11 exception comments and manifest expiry | `npm run check:standards` | automated |
| §3.8 shape names prohibited; reserved adapter names | `npm run check:standards` | automated |
| §3.9 no barrels or re-exports | `npm run check:standards` | automated |
| §4.1, §4.2 test identifiers on interactive elements, with the role grammar | `npm run check:standards` | automated |
| §4.3 test identifier uniqueness: sources, artifact, rendered app | `npm run check:standards`, `npm run verify:build`, `npm run test:e2e` | automated |
| §4.4 test identifiers retained in the production bundle | `npm run verify:build` | automated |
| §5.6, §15 no user-visible literals; locale keys complete and used | `npm run check:standards`, `npm run test:unit` | automated |
| §6 0-indexed positions | `npm run test:unit` once track positions exist (Phase 2) | manual-review until then |
| §7.6 gzip baseline of the client bundle | `npm run verify:build` | automated |
| §8.1 every PURE export has a unit test | `npm run check:standards` | automated |
| §8.2 every reducer action has a transition test | `npm run check:standards` | automated |
| §8.3 every user-visible flow has an end-to-end test against the built server | `npm run test:e2e` | automated for listed flows; coverage of flows is manual-review |
| §9.2 bundle growth within the gzip baseline | `npm run verify:build` | automated |
| §9.1, §9.2, §9.7 library selection and measured per-library cost | — | manual-review, recorded in ADRs and `.architecture-exceptions.json` |
| §10 MIT license; attribution of every package the browser bundle imports | `npm run check:standards` | automated |
| §12 repository conventions | — | manual-review |
| §13 documentation style and ADRs | — | manual-review |
| §18 mandated bindings match the manifest | `npm run check:bindings` | automated |
| Hosted profile: migrations immutable, timestamp-named, one per commit | `npm run check:migrations` | automated |
| Hosted profile: row-level security on every library table | `npm run test:integration` | automated |
| Hosted profile: content security policy without unsafe sources; no inline script; no secret or connection string in the browser bundle | `npm run verify:build` | automated |
| §7.3 CI runs the same build, then end-to-end tests as a separate job | `.github/workflows/build.yml` | automated |

## Local interpretations

These apply the adopted text to a hosted target. They are recorded for owner review and are not changes to the policy.

| ID | Rule | Interpretation |
|---|---|---|
| LI-1 | Shared foundation: no external URLs at runtime (motivated by offline `file://` use) | First-party code and assets are bundled and served by this server. The only third-party runtime origins are Apple's: the MusicKit on the Web script, the Apple Music API and Apple's artwork CDN. The Content-Security-Policy enumerates them and the artifact verifier checks it. |
| LI-2 | §3.2 one export per PURE file | `src/contracts/**` files export one TypeBox schema constant, named for the file, with its static type, or types only. |
| LI-3 | §4.2 identifier roles | Rows that open a detail screen use `button`; primary navigation uses `tab`. |
| LI-4 | §6 0-indexing | Positions and disc indexes are 0-based. Printed track numbers are domain labels kept as text. |
| LI-5 | §12 separate app and data tracks | This application ships no independently released dataset, so it has one track, tagged `apple-music-app`. Database schema history is the migration sequence. |
| LI-6 | §9.2 runtime budget | Applies to the browser bundle. Server dependencies do not ship to the browser; their selection is justified in [ADR-0006](adr/0006-application-stack.md). |
| LI-7 | §7.2 build sequence | Integration tests against Postgres run after unit tests and before the bundle. |

## Exceptions

Repository-wide exceptions live in [.architecture-exceptions.json](../.architecture-exceptions.json); file-level exceptions use the §3.7 comment template. Standing mandated bindings live in [.architecture-bindings.json](../.architecture-bindings.json) and are reviewed annually rather than expiring; `npm run check:bindings` reports a due review without failing.
