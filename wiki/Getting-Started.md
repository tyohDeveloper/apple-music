# Getting started

Setup instructions arrive with Phase 1 and will be kept in the repository [README](https://github.com/tyohDeveloper/apple-music/blob/main/README.md).

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
