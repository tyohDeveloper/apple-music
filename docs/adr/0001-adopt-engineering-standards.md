# ADR-0001: Adopt Engineering Standards v2.2 with the hosted-Postgres profile

## Status and date

Accepted, 2026-10-19. Owner: @tyohDeveloper.

## Context

The owner requires this application to inherit the Engineering Standards' architecture, coding and other standards. The standards hub, `tyohDeveloper/engineering-standards` at `f30e6e09b436024a00bbc4f89982db3696fb97c3`, holds immutable snapshots of policy v2.2 (portable edition) and adoption templates; it has not issued a newer normative release. Target-specific profiles — hosted Postgres; PLATFORM, MODEL and REMOTE; data layer; localization; repository conventions — remain companion pages in the programming Project wiki and have not been exported to the hub.

This application is a hosted web application with a Postgres datastore, a server-side integration with the Apple Music API and a browser client.

## Decision

1. Adopt policy v2.2, portable edition, from the hub snapshot `references/source-snapshots/history-and-prehistory/CODING-STANDARDS.md`, retained byte-identical at `docs/standards/portable-v2.2.md` with its SHA-256 recorded and verified by the standards check.
2. Apply the hosted-Postgres target profile and the PLATFORM, MODEL and REMOTE, data-layer, localization and repository-convention profiles as read on 2026-10-19, recorded rule by rule in `docs/standards/hosted-postgres-profile.md`.
3. Keep this repository's role and path mapping in `docs/ARCHITECTURE.md`; the §0 mapping inside the copied policy is History & Prehistory's and does not apply.
4. Record local interpretations for a hosted target in `docs/CODING-STANDARDS.md` for owner review rather than editing the policy.
5. Register the adoption in the hub (`adoption/apple-music.json`) once this repository's checks exist and pass.

## Alternatives rejected and why

- **Copy another application's `CODING-STANDARDS.md` and edit its §0.** Mixes another application's mapping and standalone-target rules into this repository and produces an edited policy copy with no authority.
- **Link to the hub without a local copy.** The adoption template requires the complete policy locally or an explicit retrieval step; a link does not prove an agent read it.
- **Write application-specific standards.** Diverges from the family baseline and loses the shared enforcement history.

## Consequences

- The checker must cover the whole repository from Phase 1, including views and controllers (§16.1).
- Standalone-HTML5 and artifact-contract rules do not apply; the hosted profile's operational rules do.
- A newer policy release is adopted by a new ADR that supersedes this one.

## Evidence and approval

Owner request of 2026-10-19. Hub commit `f30e6e09b436024a00bbc4f89982db3696fb97c3`; snapshot SHA-256 `f5d3916eb6877ce8e7d0e4d1108b4707e7579f74643906194faced62abdad2f2`, matching the hub's `references/source-manifest.json`.

## Supersession

None.
