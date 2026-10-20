// One album in a list: title, who is credited, kind, release date and the size of its
// intended track list and editions.
import type { AlbumSummary } from "../../contracts/albums/albumSummarySchema.ts";
import type { Messages } from "../controllers/useMessages.ts";

type AlbumCardProps = { readonly messages: Messages; readonly album: AlbumSummary; readonly onOpen: (albumId: string) => void };

export function AlbumCard({ messages, album, onOpen }: AlbumCardProps) {
  const { t } = messages;
  const facts = [
    messages.displayName("albumKind", album.kind),
    ...(album.released === null ? [] : [album.released]),
    t("albums.trackCount", { count: messages.number(album.trackCount) }),
    t("albums.editionCount", { count: messages.number(album.editionCount) }),
  ];
  return (
    <button type="button" class="card" data-testid={`button-albums-open-${album.id}`} onClick={() => onOpen(album.id)}>
      <span class="card-title">{album.title}</span>
      {album.creditLine !== "" && <span class="card-meta">{album.creditLine}</span>}
      <span class="card-meta">{facts.join(" · ")}</span>
    </button>
  );
}
