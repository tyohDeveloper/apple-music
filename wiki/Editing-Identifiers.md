# Editing identifiers

Other systems give performers, albums, editions and recordings identifiers of their own: Apple Music's library and catalog ids, the ISRC of a recording, the UPC barcode of an edition, and MusicBrainz, Discogs and Wikidata ids. Recording them ties your catalog to those systems. Imports from Apple Music (Phase 3) match on Apple's ids, lookups in other databases (Phase 6) start from them, and two entries in your library that share an identifier are probably the same thing.

## The identifiers panel

The **Identifiers** panel on a performer's, album's, edition's or recording's page lists its identifiers by system. Choose the system, enter the identifier and choose **Add identifier**; **Remove** takes one off. Each change is saved at once.

An identifier must have the form its system uses, shown in the table below. One that does not is marked on its field with the reason, is not saved, and stays in the field to be corrected. Spaces and hyphens in an ISRC or UPC are dropped, ISRCs and Wikidata ids are stored in capitals, and MusicBrainz ids in lower case, so `us-sm1-59-00113` is stored as `USSM15900113`. Adding an identifier the entry already has changes nothing.

MusicBrainz, Discogs and Wikidata identifiers link to their pages on those sites, opening in a new tab.

## Which identifiers go where

| System | Performer | Album | Edition | Recording | Form |
|---|---|---|---|---|---|
| Apple Music library | Library artist | | Library album | Library song | Apple's id for the item in your library, such as `i.e5gmPS6rZ856` for a song |
| Apple Music catalog | Artist | | Album | Song | Digits |
| ISRC | | | | Yes | Twelve characters: two letters, three letters or digits, two digits for the year, five digits ([ISRC Handbook](https://isrc.ifpi.org/images/downloads/ISRC_Handbook.pdf)). Printed codes read like `ISRC AA-6Q7-20-00047`; enter them without the `ISRC` label |
| UPC or EAN | | | Yes | | 12 to 14 digits: UPC-A, EAN-13 or GTIN-14 |
| MusicBrainz | Artist | Release group | Release | Recording | A MusicBrainz id: 32 hexadecimal digits in groups of 8, 4, 4, 4 and 12 |
| Discogs | Artist | Master release | Release | | Digits |
| Wikidata | Item | Item | | Item | `Q` followed by digits |

An album here is the record its artists intended, so it takes only the identifiers that mean the same thing: a MusicBrainz release group, a Discogs master release, a Wikidata item. What Apple Music calls an album, and what a UPC numbers, is something issued and sold: an edition. An ISRC numbers one recording, whatever album or edition it appears on ([IFPI: when not to assign an ISRC](https://isrc.ifpi.org/why-use-isrc/when-not-to-assign)).

Apple does not document the form of its library ids. Library songs have ids starting with `i.` ([Apple developer forums](https://developer.apple.com/forums/tags/apple-music-api?page=3)); any id of letters, digits, `.`, `_` and `-` is accepted.
