# Plan of record

This file is the durable plan for the Apple Music Library Manager. It is updated at each phase boundary; decisions are recorded as ADRs in [docs/adr/](adr/) and referenced here.

**Active phase:** Phase 2 — curated catalog, built in slices ([docs/design/catalog.md](design/catalog.md)); slices A (performers), B (recordings and credits), C (albums and editions), D (genres) and E (external identifiers) are done; F (JSON export) is next. Phase 1 (foundation) was completed 2026-10-19 as version 0.1.0.0; see the phase log below.

## Requirements

Each requirement traces to the owner's request of 2026-10-19. IDs are stable; later requirements are appended.

| ID | Requirement | Addressed by |
|---|---|---|
| R-1 | A web application for managing Apple Music libraries | Phases 1–5 |
| R-2 | Inherits the Engineering Standards: architecture, coding and other standards | [ADR-0001](adr/0001-adopt-engineering-standards.md), [CODING-STANDARDS.md](CODING-STANDARDS.md) |
| R-3 | A datastore; JSON files or Postgres to be decided | [ADR-0002](adr/0002-postgres-system-of-record.md) |
| R-4 | Attaches to an Apple Music library identified by an id; one datastore per Apple ID | [ADR-0003](adr/0003-library-partitioning-and-isolation.md) |
| R-5 | Exactly one user initially; more users later | [ADR-0003](adr/0003-library-partitioning-and-isolation.md), [ADR-0008](adr/0008-access-model.md) |
| R-6 | Uses the Apple Music web APIs | [ADR-0005](adr/0005-apple-music-integration-boundary.md) |
| R-7 | TypeScript | [ADR-0006](adr/0006-application-stack.md) |
| R-8 | Repository `apple-music` under `tyohDeveloper` | This repository |
| R-9 | Open access | Public repository — [ADR-0008](adr/0008-access-model.md) |
| R-10 | MIT license | [LICENSE](../LICENSE) |
| R-11 | No playback | Out of scope; [ADR-0005](adr/0005-apple-music-integration-boundary.md) |
| R-12 | Primary use is library maintenance and added metadata | Phases 2–4 |
| R-13 | Will consult other music and recording databases | Phase 6; REMOTE port per source |
| R-14 | Albums and recordings are first-class objects | [DOMAIN-MODEL.md](DOMAIN-MODEL.md) |
| R-15 | Performers are first-class: individuals, bands, groups, choirs, orchestras and similar | [DOMAIN-MODEL.md](DOMAIN-MODEL.md) |
| R-16 | A performer may have several names: initials, spelling changes, name changes, stage names | `performer_name` |
| R-17 | Performers relate to one another: band membership, duets, featured artists, soloist with orchestra | `performer_relation` and credits |
| R-18 | Albums are intentional; added demos, live recordings, interviews and similar extras are to be cleaned up | `edition`, `edition_track.inclusion`, `album_track` |
| R-19 | A soloist's album may draw on several performances with different orchestras | Per-recording credits |
| R-20 | An album is not split because different tracks have different performers | Album identity independent of credits |
| R-21 | Keeps albums, recordings, performers, genres and other metadata | Phase 2 schema |
| R-22 | Manages and changes that information itself, not only in Apple Music | Curated data is the system of record |
| R-23 | Changes some information in Apple Music | Phase 5 change outbox |
| R-24 | Other streaming services later (not near term) | Source-neutral mirror and REMOTE port; Phase 8+ |
| R-25 | Native apps later (Windows, macOS, iOS, ChromeOS and others) | HTTP API as the only client contract; Phase 8+ |
| R-26 | Initially a web app | [ADR-0006](adr/0006-application-stack.md) |
| R-27 | A project wiki | [ADR-0007](adr/0007-wiki-published-from-repository.md), [wiki/](../wiki/README.md) |

## Decisions

| ID | Decision | Record |
|---|---|---|
| D-1 | Adopt Engineering Standards policy v2.2 (portable edition) with the hosted-Postgres target profile | [ADR-0001](adr/0001-adopt-engineering-standards.md) |
| D-2 | Postgres is the system of record; JSON is the export and interchange format | [ADR-0002](adr/0002-postgres-system-of-record.md) |
| D-3 | One database; every curated row carries `library_id`; row-level security isolates libraries | [ADR-0003](adr/0003-library-partitioning-and-isolation.md) |
| D-4 | Album, edition, recording and track are separate entities; performers carry names and relations; credits record the name used | [ADR-0004](adr/0004-domain-model.md) |
| D-5 | Apple Music is a REMOTE source; MusicKit on the Web only authorizes; supported writes go through an approval outbox | [ADR-0005](adr/0005-apple-music-integration-boundary.md) |
| D-6 | Node 24 LTS, TypeScript 6, Fastify 5, Drizzle, Better Auth, Preact and Vite | [ADR-0006](adr/0006-application-stack.md) |
| D-7 | The wiki is authored in `wiki/` and published to the GitHub Wiki by a workflow | [ADR-0007](adr/0007-wiki-published-from-repository.md) |
| D-8 | Public MIT repository; the running application requires sign-in; sign-up closed until multi-user | [ADR-0008](adr/0008-access-model.md) |
| D-9 | Taxonomy values are enforced by request schemas built from the taxonomy files; writes need the owner or editor role in row-level security; ordered lists are replaced whole; referenced entities are not deleted | [ADR-0009](adr/0009-catalog-integrity.md) |

## Phases

Each phase ends with `npm run build` and the end-to-end suite green locally and in CI, and with this file updated.

| Phase | Scope | Exit criteria |
|---|---|---|
| 0 — Plan checkpoint | README, license, plan, domain model, architecture, standards adoption, ADRs, wiki source | Committed and pushed before any build phase |
| 1 — Foundation | Toolchain; standards checker; data validation; CI with a Postgres service; Fastify server with health, metrics, request logging, rate limiting and security headers; database roles and first migrations; owner sign-in; localized single-page shell; backup and restore runbook | Build and CI green; sign-in flow covered end to end |
| 2 — Curated catalog | Schema, repositories, HTTP API and screens for performers, names, relations, albums, editions, recordings, tracks, credits, genres and external identifiers; JSON export of a library | CRUD flows covered end to end; isolation between libraries proven by integration tests |
| 3 — Apple Music import | Developer token, MusicKit authorization, encrypted Music User Token, sync runs over library songs, albums, artists and playlists with catalog enrichment; mapping into the curated model: credit parsing, edition grouping, track classification; guard against attaching a different library | Sync exercised against a contract-faithful Apple Music fake in CI; live check by the owner with real credentials |
| 4 — Cleanup workflows | Review queue for classified extras, intended track lists, album merge and split, performer merge, name-variant and relation editing | Each workflow covered end to end |
| 5 — Apple Music changes | Approval outbox; intended-album playlists in a folder; ratings and favorites; adding catalog items | Each operation covered against the fake; live check by the owner |
| 6 — Other databases | MusicBrainz lookup through a rate-limited REMOTE adapter; match suggestions that fill in external identifiers | Lookups covered against a recorded fake |
| 7 — Depth | Works and compositions; edit history; Sign in with Apple; opening sign-up for more users | Per feature |
| 8+ — Reach | Other streaming services through their own adapters; native wrappers per the native-wrappers profile | Per target |

## Phase log

| Phase | Completed | Notes |
|---|---|---|
| 0 | 2026-10-19 | Plan, domain model, architecture, ADR-0001 to ADR-0008, wiki source |
| 1 | 2026-10-19 | Standards checker with planted-violation controls; migrations, bindings and artifact checks; three database roles with row-level security on `library` and `library_member`; owner sign-in with Better Auth and argon2; localized Preact shell with library list and creation; health, metrics, rate limits, CSP; CI with PostgreSQL 18.6; backup runbook with a rehearsed restore. Preact's measured 5,350-byte gzip cost exceeds the §9.2 per-library ceiling and is recorded as EXC-0001 (expires 2027-04-19). The MusicKit script binding is added with the Apple Music work in Phase 3. |

## Open questions for the owner

| ID | Question | Default until answered |
|---|---|---|
| Q-1 | Production host and Postgres provider (Replit is not in active use) | Any Node 24 host with managed Postgres 18; nothing host-specific in the code |
| Q-2 | Apple Developer Program credentials: Team ID, MusicKit key ID and private key | The application runs without them; Apple features report "not configured" |
| Q-3 | Long-term sign-in method: email and password, Sign in with Apple, or passkeys | Email and password for the single owner |
| Q-4 | Wiki editing on GitHub | Restrict editing to collaborators; the repository copy wins on publish |

## Out of scope

Playback, catalog browsing for listening, recommendation features, and any edit Apple's API does not support.
