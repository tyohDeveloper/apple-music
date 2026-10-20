// The albums that credit a performer or play a recording, on that performer's or recording's
// page; a recording on an album cannot be deleted, so this is where to look first.
import type { LinkedAlbumsControls } from "../controllers/useLinkedAlbums.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { pageRangeOf } from "../state/catalog/catalogListReducer.ts";
import { AlbumCard } from "./AlbumCard.tsx";
import { CatalogPager } from "./CatalogPager.tsx";

type LinkedAlbumsPanelProps = {
  readonly messages: Messages;
  readonly heading: string;
  readonly empty: string;
  readonly controls: LinkedAlbumsControls;
  readonly onOpenAlbum: (albumId: string) => void;
};

export function LinkedAlbumsPanel({ messages, heading, empty, controls, onOpenAlbum }: LinkedAlbumsPanelProps) {
  const { state } = controls;
  const range = pageRangeOf(state);
  return (
    <section class="panel" aria-labelledby="linked-albums-heading">
      <h2 id="linked-albums-heading">{heading}</h2>
      {state.failure !== null && <p role="alert" class="error" data-testid="display-linkedalbums-error">{messages.errorMessage(state.failure)}</p>}
      {state.status === "loaded" && range.total === 0 && <p data-testid="display-linkedalbums-empty">{empty}</p>}
      <ul class="card-list" data-testid="panel-linkedalbums-results">
        {state.items.map((album) => (
          <li key={album.id}>
            <AlbumCard messages={messages} album={album} onOpen={onOpenAlbum} />
          </li>
        ))}
      </ul>
      <CatalogPager messages={messages} list="linkedalbums" range={range} onPrevious={controls.showPrevious} onNext={controls.showNext} />
    </section>
  );
}
