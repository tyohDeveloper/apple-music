# Exporting a library

The library home has an **Export** section. **Download the JSON export** saves the library's whole curated catalog as one JSON file named after the library and the day, such as `my-library-2026-10-19.json`. Any member of the library can download it, viewers included.

## What the file holds

- Every genre, with its place in your tree and its aliases.
- Every performer, with all of its names, genres and identifiers, and the relations between performers.
- Every recording, with its credits, genres and identifiers.
- Every album, with its credits, intended track list, genres and identifiers, and each of its editions with their tracks and identifiers.

Entries refer to each other by id: a credit names its performer's id, a track its recording's id. Kinds, roles and inclusions appear as codes (`group`, `primary`, `bonus`), the same whatever language the application is shown in. The file is one snapshot: a change saved while it is being written is either wholly in it or not in it at all.

The file does not hold accounts, passwords, sign-in sessions or Apple Music tokens.

## Checking a file

The file's structure is published as a JSON Schema, [library-export.schema.json](https://github.com/tyohDeveloper/apple-music/blob/main/docs/schemas/library-export.schema.json), which any JSON Schema 2020-12 validator can check a file against. `formatVersion` changes only when a reader of an older file could misread a newer one; `application.version` records the version of the application that wrote the file.

## What it is not

The export is a readable copy of your catalog and a way to use it elsewhere. It cannot be imported back yet. The full backup of an installation, accounts included, is a database dump; see [Backup and restore](https://github.com/tyohDeveloper/apple-music/blob/main/docs/ops/backup.md).
