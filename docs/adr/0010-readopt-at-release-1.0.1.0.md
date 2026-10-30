# ADR-0010: Re-adopt the engineering standards at release 1.0.1.0

## Status and date

Accepted, 2026-10-30. Owner: @tyohDeveloper. Supersedes the policy pin in [ADR-0001](0001-adopt-engineering-standards.md); ADR-0001 remains the record of the original adoption.

## Context

ADR-0001 adopted the v2.2 portable edition at hub commit `f30e6e0`, with the companion wiki pages read directly because the hub had not exported them. The hub has since released 1.0.0.0 (delivery profiles, language-independent core C-1–C-49 with bindings, authority transferred from the wiki; hub ADR-0002, 0003, 0004) and 1.0.1.0 (refinements from the OmniUnit pilot). The wiki pages this repository cited are now pointers. The hub registered this repository's 2.2 adoption as a schema-1 record; re-adoption requires a schema-2 record with a declared delivery profile and bindings.

## Decision

1. Adopt release 1.0.1.0 (tag `standards-1.0.1.0`, commit `bb876dd97747e1940aa41ea480eac85044b737aa`). The policy text is retrieved from the hub at that tag; the v2.2 copy is retained as the superseded predecessor.
2. Declare the delivery profile: hosted-durable, hosted-web, sql+json+blob, authenticated, network required, interactive; localization language-only, dynamic, domains `interface` and `display-names`, locale `en`. Ports `Store`, `Secrets` (environment), `Jobs` (in-process), `Identity`, `Files`. Bindings `typescript:application`, `sql:schema`.
3. Keep the existing checker and its v2.2 section numbering; record the section-to-core-rule mapping in `docs/CODING-STANDARDS.md` rather than renumbering checker output now.
4. Record two new exceptions for 1.0.x rules without a v2.2 counterpart: EXC-0002 (C-10 application-layer scoping invariant; RLS and MODEL predicates enforce today) and EXC-0003 (C-31 repository-wide secret scanner; the bundle check exists). Both expire 2027-04-30.
5. Pin CI runner images to `ubuntu-24.04` per 1.0.1.0 C-19, with a review note.

## Alternatives rejected and why

| Alternative | Why rejected |
|---|---|
| Stay on v2.2 | Its authority clause points at wiki pages that no longer carry text; the hub is the only maintained source |
| Renumber checker output to C-n now | Larger change with no behavioural gain; the mapping table gives reviewers the correspondence, and a later checker release can emit both |
| Treat RLS as satisfying C-10 | The rule exists precisely so code stays correct where RLS is absent (a device-durable edition is a stated future for this application) |

## Consequences

- `STANDARDS-ADOPTION.json` moves to schema 2; the hub record is updated by PR after this merges.
- `.architecture-exceptions.json` gains EXC-0002 and EXC-0003; `check:standards` enforces their expiry.
- No application code changes in this adoption. Follow-ups: PURE scope predicate with tests (closes EXC-0002); secretlint or gitleaks in CI (closes EXC-0003).

## Evidence and approval

Owner direction of 2026-10-30 in the standards thread; hub releases 1.0.0.0 and 1.0.1.0; reference adoption OmniUnitConverter-Calculator at `02db5bd`.

## Supersession

Supersedes the policy version and source commit stated in ADR-0001. Nothing else.
