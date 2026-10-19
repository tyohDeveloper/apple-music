# Concepts

The full specification is [docs/DOMAIN-MODEL.md](https://github.com/tyohDeveloper/apple-music/blob/main/docs/DOMAIN-MODEL.md). This page explains the ideas.

## Albums, editions, recordings and tracks

| Term | Means | Example |
|---|---|---|
| **Album** | The release its artists intended | A band's third studio album |
| **Intended track list** | The album's tracks in their original order | The ten songs of the original record |
| **Edition** | One issued form of the album | Apple Music's "Deluxe Edition" with 24 tracks |
| **Edition track** | One track of an edition, classified against the album | Track 14 of the deluxe edition: a demo |
| **Recording** | One captured performance, wherever it appears | The studio take of a song, on the album and on a greatest-hits set |

An edition track's **inclusion** says how it relates to the intended album: `core` (part of the album), `bonus`, `demo`, `live`, `alternate`, `interview`, `commentary`, `remix`, `instrumental`, `single-edit`, `hidden` or `unknown`. Imports guess from title markers such as "(Demo)" or "- Live at …" and record which marker matched; anything you set yourself is kept on later imports.

An album does not become a different album because its tracks have different performers. Credits belong to recordings.

## Performers

A **performer** is anyone credited: a person, group, duo, orchestra, choir or ensemble.

### Names

A performer can have many names, each with a kind and the years it was used:

| Kind | Example |
|---|---|
| primary | The name you want shown |
| legal, birth | A person's legal or birth name |
| stage | A stage name |
| alias | Another name the performer has used |
| spelling-variant | A different spelling or added initials |
| former | A name no longer used |
| transliteration | The name in another script |
| abbreviation | A shortened form |

Exactly one name is preferred for display. A credit records which name was printed, so an album credited to "John R. Cash" and another to "Johnny Cash" both point at one performer.

### Relations

| Relation | Example |
|---|---|
| member of | A guitarist is a member of a band, from one year to another |
| conductor of | A conductor's tenure with an orchestra |
| music director of | A choir's director |
| subgroup of | A chamber ensemble drawn from an orchestra |
| persona of | A stage persona kept as its own performer |
| successor of | A band that re-formed as a different entity |
| collaborator with | A standing partnership that is not a group |

## Credits

Credits join performers to recordings and albums with a role:

| Situation | Credits |
|---|---|
| A duet | two `primary` credits joined by " & " |
| A featured singer | `primary` for the main artist, `featured` for the guest |
| A concerto | `soloist`, `orchestra` and `conductor` on each recording |
| A song's writers | `composer` and `lyricist` |

A soloist's album built from three concerts with three orchestras is one album; each track's recording carries its own orchestra and conductor.

## Genres

Genres are yours: rename, nest and assign them to albums, recordings and performers. Apple's genre names are mapped onto your genres, so changing your mind is one edit.

## Libraries

A **library** is the datastore for one Apple ID. Everything you curate belongs to exactly one library, and the database refuses to let one library's data be read through another.
