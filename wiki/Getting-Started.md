# Getting started

The repository [README](https://github.com/tyohDeveloper/apple-music/blob/main/README.md) holds the authoritative setup and build commands; this page explains them.

## Requirements

| Requirement | Version |
|---|---|
| Node.js | 24 LTS |
| PostgreSQL | 18 |
| Apple Developer Program | For Apple Music features: Team ID, MusicKit key id and private key |

## Environment

Configuration comes from environment variables, listed with explanations in `.env.example`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Application role: request handling and imports |
| `DATABASE_AUTH_URL` | Authentication role: sign-in and sessions |
| `DATABASE_ADMIN_URL` | Owner role: migrations and administrative scripts |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Session signing and the public origin |
| `TOKEN_ENCRYPTION_KEY` | Encrypts stored Music User Tokens |
| `APPLE_TEAM_ID`, `APPLE_MUSICKIT_KEY_ID`, `APPLE_MUSICKIT_PRIVATE_KEY` | Apple developer credentials |
| `OWNER_EMAIL`, `OWNER_NAME`, `OWNER_PASSWORD` | The owner account `npm run seed` creates |

## First run

1. A database administrator creates the owner role (`LOGIN CREATEROLE`) and a database it owns.
2. `npm install`, then copy `.env.example` to `.env` and fill it in.
3. `npm run db:bootstrap` creates the application and authentication roles with the passwords in the database URLs.
4. `npm run seed` applies the migrations, creates the owner account and an empty library.
5. `npm run dev` starts the API server and the Vite dev server; open http://localhost:5173 and sign in.

Sign-up is closed: the owner account is the only account until sign-up opens in a later phase.

## Backups

[docs/ops/backup.md](https://github.com/tyohDeveloper/apple-music/blob/main/docs/ops/backup.md) describes the dump, the restore and the rehearsal record.
