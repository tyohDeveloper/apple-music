# Apple Music Library Manager

A web application for maintaining an Apple Music library as a curated catalog — intentional albums, distinct recordings, and performers with their names and relationships — kept in a datastore of its own and synchronized with Apple Music.

**Status:** Phase 2 in progress on version 0.1.0.0: owner sign-in, libraries, and performers with all their names and relations. Recordings, albums and editions come next; see [the plan of record](docs/PLAN.md). There is no deployed instance yet.

## What it is for

- **Albums and recordings are first-class objects.** An album is the release its artists intended. The editions Apple Music offers (deluxe, expanded, remastered) are tracked separately, and each edition track is classified as part of the intended album or as an extra: demo, live take, interview, alternate take, remix, bonus track.
- **Performers are first-class objects.** People, bands, duos, choirs, orchestras and ensembles, each with any number of names (stage names, spelling changes, initials, former names) and relationships (member of a band, conductor of an orchestra, persona of a person).
- **Credits are recorded per recording.** A soloist's album assembled from sessions with different orchestras stays one album; each track keeps its own soloist, orchestra and conductor credits, and featured or duet partners keep their own roles.
- **Curated metadata lives here.** Genres, dates, credits and notes are edited in this application and are not overwritten by later imports from Apple Music.

## What it does not do

- **No playback.** It is a maintenance tool, not a player.
- **No in-place edits of Apple Music items.** The Apple Music API has no endpoints to rename, re-tag or delete existing library items. Apple Music is changed only through the operations Apple supports: creating playlists and playlist folders, adding tracks to playlists, adding catalog items to the library, ratings, and favorites. Every such change is proposed first and applied only after approval.

## Documentation

| Document | Contents |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | Plan of record: requirements, decisions, phases, open questions |
| [docs/DOMAIN-MODEL.md](docs/DOMAIN-MODEL.md) | Entities, relationships and invariants |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Role and path mapping, boundaries, contracts |
| [docs/CODING-STANDARDS.md](docs/CODING-STANDARDS.md) | Adopted Engineering Standards release and enforcement matrix |
| [docs/adr/](docs/adr/) | Architecture decision records |
| [docs/ops/backup.md](docs/ops/backup.md) | Backup, restore and restore rehearsals |
| [wiki/](wiki/README.md) | Source of the project wiki, published to the GitHub Wiki |
| [AGENTS.md](AGENTS.md) | Contract for coding agents working in this repository |

## Quickstart

Requires Node.js 24 and PostgreSQL 18. Once per environment, a database administrator creates the owner role and the database:

```sql
CREATE ROLE apple_music_owner LOGIN CREATEROLE PASSWORD '<owner password>';
CREATE DATABASE apple_music_dev OWNER apple_music_owner;
```

Then:

```sh
npm install
cp .env.example .env   # database URLs, BETTER_AUTH_SECRET and OWNER_* (see comments in the file)
npm run db:bootstrap   # creates the application and authentication roles
npm run seed           # applies migrations, creates the owner account and an empty library
npm run dev            # http://localhost:5173
```

## Build

```sh
npm run build          # typecheck, standards, dead code, migrations, unit and integration tests,
                       # bundle, mandated bindings, artifact verification
npm run test:e2e       # end-to-end tests against the built server
npm start              # serves the built application on HOST:PORT
```

Integration and end-to-end tests read `.env.test`, which points at a separate test database (for example `apple_music_test`, created the same way). CI runs the same commands against a disposable PostgreSQL ([build workflow](.github/workflows/build.yml)).

## License

MIT — see [LICENSE](LICENSE).
