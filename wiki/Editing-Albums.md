# Editing albums

An album is the record its artists intended: its title, its kind, its credits and its intended track list. Editions are the forms it was issued in, such as the original release, a remaster, or a deluxe edition with demos and interviews added, each with tracks of its own. Open a library and choose **Albums**.

## Finding an album

Search matches the title, or any name of any performer credited on the album or on one of its intended tracks, ignoring case, accents and punctuation. Results are ordered by title, 25 to a page, and show the kind, the first release date, and how many intended tracks and editions the album has.

## Creating and editing

Create an album with its title, its kind (album, EP, single, compilation, live album, soundtrack, broadcast, spoken word, other) and, optionally, when it was first released: a year, a year and month, or a full date (`1959`, `1959-08`, `1959-08-17`). The editor also takes the label and notes.

**Delete album** asks for confirmation, then removes the album with its credits and its track list. An album that still has editions cannot be deleted; delete its editions first.

## Credits

Album credits work as [recording credits](Editing-Recordings.md#credits) do: an ordered list of performers and roles, each with the name it was credited as and the text joining it to the next. Credit the album's artists here and leave the details to the recordings: a soloist's album drawn from sessions with different orchestras is one album credited to the soloist, while each recording keeps its own orchestra and conductor.

## Genres

The **Genres** panel holds the album's genres in order, the first being its main genre; see [Editing genres](Editing-Genres.md#giving-genres-to-albums-recordings-and-performers).

## The intended track list

The intended track list is the album as its artists made it, disc by disc. Every track plays a recording from the library. To add one, find the recording, choose it and a disc, and choose **Add track**; a new disc is started by choosing **New disc**. Each track can then be given:

- **Printed number**, such as `A1` or `B2`, when the record numbers its tracks that way.
- **Printed title**, when the album prints a title other than the recording's.

**Move up**, **Move down** and **Remove** change the list; a disc whose last track is removed disappears. Nothing is stored until **Save tracks**; **Discard changes** returns to the stored list.

A recording's page lists the albums whose track lists play it, and a performer's page lists the albums that credit the performer, on the album or on one of its tracks.

## Editions

Under **Editions** on the album's page, create an edition with its title as issued and its kind (original, remaster, deluxe, expanded, anniversary, super deluxe, reissue, regional, clean, explicit, unknown). The edition's own page takes its release date, notes and tracks.

Each edition track has the title it was issued under, and says how it belongs to the album:

| Belongs to the album as | Use |
|---|---|
| Core, as intended; Hidden track | Part of the album as its artists made it |
| Bonus, Demo, Live, Alternate, Interview, Commentary, Remix, Instrumental, Single edit | Added to this edition, not part of the intended album |
| Not yet classified | Not decided yet |

A track usually names its recording, and then its title defaults to the recording's. A track whose recording is not in the library, such as an interview, can choose **No recording yet** and be given a title. As with the intended track list, **Save tracks** stores the list.

**Delete edition** asks for confirmation, then removes the edition with its tracks. A recording on any album's or edition's track list cannot be deleted.

Later phases fill editions from Apple Music: each album in the Apple Music library becomes an edition, its tracks classified from title markers such as "(Demo)"; see [Cleanup workflows](Cleanup-Workflows.md).
