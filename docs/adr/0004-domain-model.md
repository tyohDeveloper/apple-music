# ADR-0004: Albums, editions, recordings and performers as first-class entities

## Status and date

Accepted, 2026-10-19. Owner: @tyohDeveloper.

## Context

Apple Music's library model centres on songs with text fields for artist and album. The owner wants albums and recordings, and performers, as first-class objects:

- Albums are intentional; Apple Music often offers them with demos, live recordings, interviews and other material that was not part of the original release.
- A soloist's album may be assembled from several performances with different orchestras.
- An album must not be treated as different because different tracks have different performers.
- Performers are individuals, bands, groups, choirs, orchestras and similar; they may have several names, and may belong to, perform with, feature on or solo with one another.

## Decision

The model in [DOMAIN-MODEL.md](../DOMAIN-MODEL.md):

1. **Album** is the intended release; **album_track** is its intended track list.
2. **Edition** is one issued form of an album: an Apple library album, an Apple catalog album, or a manually entered edition. **edition_track** classifies each of its tracks with an `inclusion` value relative to the intended album.
3. **Recording** is one captured performance, shared by every album and edition that contains it.
4. **Performer** covers people and collectives, with a `kind` taxonomy; **performer_name** holds every name with kind, validity dates and one preferred name; **performer_relation** holds standing relationships.
5. **Credits** on recordings and albums carry role, order, join phrase and the name used (`credited_name_id`).
6. Taxonomies — performer kinds, name kinds, relation kinds, credit roles, album kinds, edition kinds, recording kinds, track inclusions, external-identifier namespaces — are declared in `data/taxonomies/` with JSON Schemas (§1.5, §5.5).
7. Positions and disc indexes are 0-based; printed track numbers are kept as labels (§6).
8. Curated fields are never overwritten by imports.

## Alternatives rejected and why

| Alternative | Why rejected |
|---|---|
| Mirror Apple's song-centric model and add columns | Album identity would stay tied to Apple's album records, which split albums by track artist and mix extras into editions. |
| Adopt the MusicBrainz schema wholesale | Much larger than needed (labels, places, events, URLs, annotations, voting); its release / release-group / medium split is reproduced here more simply by album, edition and disc index. Its identifiers are still stored as external identifiers. |
| Credits as display strings | Cannot answer "every recording with this orchestra" or keep "John R. Cash" and "Johnny Cash" as one person. |
| Track inclusion as a boolean (core or extra) | Loses the distinction between a demo, a live take and an interview, which is what cleanup acts on. |

## Consequences

- Imports must map Apple's text fields to entities: credit-string parsing, edition grouping and track classification are PURE functions with data-declared markers.
- An album can be shown as intended even when Apple only offers an expanded edition.
- Works and compositions are deferred to Phase 7; Apple's composer, work and movement fields are kept in the catalog mirror until then.

## Evidence and approval

Owner request of 2026-10-19.

## Supersession

None.
