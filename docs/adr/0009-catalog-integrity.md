# ADR-0009: Catalog integrity rules

## Status and date

Accepted, 2026-10-19. Owner: @tyohDeveloper.

## Context

Phase 2 adds the curated catalog of [DOMAIN-MODEL.md](../DOMAIN-MODEL.md): performers and their names and relations, recordings, albums, editions, genres and external identifiers. Several rules need a home: where taxonomy values are enforced, who may write, how ordered lists change, how invariants 2, 4 and 7 hold, and what deletion does.

## Decision

| Question | Options | Choice | Rationale |
|---|---|---|---|
| Where taxonomy values (performer kinds, credit roles, inclusions and the rest) are enforced | (a) database `CHECK` lists; (b) lookup tables seeded by migrations; (c) request schemas built from `data/taxonomies/*.json` | (c) | One definition per fact (§1.6, §5.5). Adding a credit role is a data change, not a migration. The database stores taxonomy keys as text; imports produce keys through PURE mapping functions that read the same files. |
| Who may write | (a) application checks only; (b) row-level security by role | (b) | Reads use `library_id = app_current_library()`; inserts, updates and deletes use `library_id = app_current_editable_library()`, which also requires the `owner` or `editor` role. A viewer's write fails in the database even if a route forgets the check. |
| How ordered lists change (credits, track lists) | (a) per-row position edits; (b) replace the whole list | (b) | A `PUT` carries the list in order; positions are array indexes (0-indexed, §6). No gaps, no duplicate positions, one transaction. Lists are short. |
| Exactly one preferred name (invariant 2) | (a) application check; (b) partial unique index; (c) index plus deferred constraint trigger | (c) | The index forbids two; the trigger, checked at commit, forbids none. Switching the preferred name inside one transaction works. |
| Partial dates (invariant 7) | (a) request validation only; (b) a `partial_date` domain | (b), plus request validation | The domain keeps imports honest; the PURE function `isPartialDate` also rejects impossible calendar dates such as `2023-02-30` before a request reaches the database. |
| Deletion of referenced entities | (a) cascade; (b) refuse while referenced | (b) | A performer with credits, a recording on a track list, an album with editions or a genre in use cannot be deleted; the API answers `409` with the reason. Merging (Phase 4) is the way to remove duplicates. |
| Identifiers | (a) serial integers; (b) UUIDs | (b) | Primary keys are `(library_id, id)` with random UUIDs; every foreign key is composite (invariant 1). |

## Consequences

- Every catalog table has two policies (read; write) and a composite primary key.
- Request schemas for taxonomy fields are generated from the taxonomy files at server start.
- The library-role `CHECK` in the Phase 1 migration predates this decision; an integration test keeps it equal to `data/taxonomies/library-roles.json`.

## Evidence and approval

Owner request of 2026-10-19 (R-14 to R-22 in [PLAN.md](../PLAN.md)); standards §1.6, §5.5, §6; hosted-Postgres profile (row-level security for user data).

## Supersession

None.
