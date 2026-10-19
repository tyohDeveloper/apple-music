# Adopted coding standards

## Adopted release

| Item | Value |
|---|---|
| Policy | Engineering Standards v2.2, portable edition |
| Source | [tyohDeveloper/engineering-standards](https://github.com/tyohDeveloper/engineering-standards) at `f30e6e09b436024a00bbc4f89982db3696fb97c3` |
| Source path | `references/source-snapshots/history-and-prehistory/CODING-STANDARDS.md` (origin: `history-and-prehistory` at `62c721d9b269bd6b25e202d0dbc8d94edf1e5d3b`) |
| Local copy | [standards/portable-v2.2.md](standards/portable-v2.2.md), byte-identical, SHA-256 `f5d3916eb6877ce8e7d0e4d1108b4707e7579f74643906194faced62abdad2f2` |
| Provenance record | [standards/source-manifest.json](standards/source-manifest.json) |
| Approval | Owner request of 2026-10-19: "It inherits the standards the Engineering Standards architecture, coding, and other standards" |
| Decision record | [ADR-0001](adr/0001-adopt-engineering-standards.md) |

The local copy is retained in full so every agent reads the same text from the checkout. Its §0 path mapping and its references to a standalone single-file artifact belong to History & Prehistory and do not apply here; this repository's mapping is [ARCHITECTURE.md](ARCHITECTURE.md). The copy is never edited; the standards check verifies its hash.

## Companion profiles

The baseline delegates target-specific rules to companion pages in the programming Project wiki that the hub has not yet exported. They were read on 2026-10-19; [standards/hosted-postgres-profile.md](standards/hosted-postgres-profile.md) records how each applicable rule is met here.

| Profile | Applies | Notes |
|---|---|---|
| Hosted Postgres | Yes | The deployment target |
| PLATFORM, MODEL and REMOTE roles | Yes | MODEL for this repository's datastore; REMOTE for Apple Music and for the browser's access to this server |
| Data layer | Yes | Taxonomies, classification markers, locale strings |
| Localization | Yes | English only at first; two translation domains |
| Repository conventions | Yes | |
| Architecture-review lessons | Yes | |
| Standalone HTML5 and artifact contract | No | Not a single-file artifact |
| Native wrappers | Later | When a native target is added |

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
