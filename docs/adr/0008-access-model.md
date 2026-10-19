# ADR-0008: Public repository; the running application requires sign-in

## Status and date

Accepted, 2026-10-19. Owner: @tyohDeveloper. Records how "open access" is read; superseded if the owner meant something else.

## Context

The owner asked for open access and the MIT license. The repository conventions make repositories public by default, noting that MIT is meaningless on a private repository. The running application stores Music User Tokens, which grant read and write access to an Apple Music library, and the owner's curated catalog. There is exactly one user at first and more later.

## Decision

1. **The repository is public** under the MIT license.
2. **The application requires sign-in.** Every `/api/**` route except health, metrics and sign-in needs a session.
3. Better Auth with email and password, hashed through `argon2`. Public sign-up is disabled; `npm run seed` creates the owner account.
4. Opening sign-up for more users is a configuration change plus bot protection and per-user library creation, planned for Phase 7, together with Sign in with Apple as an option.

## Alternatives rejected and why

| Alternative | Why rejected |
|---|---|
| No sign-in on the running application | Anyone reaching the server could read or alter the curated catalog and issue changes to the owner's Apple Music library |
| Sign in with Apple only, now | Needs a Services ID and a registered HTTPS domain and does not work on `localhost`, which blocks local development |
| Email magic links | Needs an email provider before there is a second user |

## Consequences

- Sign-in is rate-limited; bot protection is not needed while sign-up is closed.
- Session cookies are `HttpOnly`, `SameSite=Lax` and `Secure` outside development.

## Evidence and approval

Owner request of 2026-10-19; repository conventions.

## Supersession

None.
