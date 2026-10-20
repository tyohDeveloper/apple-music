import type { AlbumListControls } from "../controllers/useAlbumList.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { pageRangeOf } from "../state/catalog/catalogListReducer.ts";
import { AlbumCard } from "./AlbumCard.tsx";
import { AlbumCreateForm } from "./AlbumCreateForm.tsx";
import { CatalogPager } from "./CatalogPager.tsx";

type AlbumsViewProps = {
  readonly messages: Messages;
  readonly controls: AlbumListControls;
  readonly onBack: () => void;
  readonly onOpen: (albumId: string) => void;
};

function AlbumResults({ messages, controls, onOpen }: Omit<AlbumsViewProps, "onBack">) {
  const { t } = messages;
  const { state } = controls;
  const range = pageRangeOf(state);
  return (
    <>
      {state.status === "loading" && <p data-testid="display-albums-loading">{t("app.loading")}</p>}
      {state.failure !== null && <p role="alert" class="error" data-testid="display-albums-error">{messages.errorMessage(state.failure)}</p>}
      {state.status === "loaded" && range.total === 0 && <p data-testid="display-albums-empty">{t("albums.empty")}</p>}
      <ul class="card-list" data-testid="panel-albums-results">
        {state.items.map((album) => (
          <li key={album.id}>
            <AlbumCard messages={messages} album={album} onOpen={onOpen} />
          </li>
        ))}
      </ul>
      <CatalogPager messages={messages} list="albums" range={range} onPrevious={controls.showPrevious} onNext={controls.showNext} />
    </>
  );
}

export function AlbumsView({ messages, controls, onBack, onOpen }: AlbumsViewProps) {
  const { t } = messages;
  return (
    <>
      <section class="panel" aria-labelledby="albums-heading">
        <button type="button" class="link-button" data-testid="button-albums-back" onClick={onBack}>
          {t("albums.back")}
        </button>
        <h1 id="albums-heading">{t("albums.heading")}</h1>
        <form class="search-form" data-testid="panel-albums-search" onSubmit={(event) => controls.search(formValuesOf(event))}>
          <label class="field">
            <span>{t("albums.search.label")}</span>
            <input name="query" type="search" maxLength={200} defaultValue={controls.state.query} data-testid="input-albums-query" />
          </label>
          <button type="submit" data-testid="button-albums-search">{t("albums.search.submit")}</button>
        </form>
        <AlbumResults messages={messages} controls={controls} onOpen={onOpen} />
      </section>
      <AlbumCreateForm messages={messages} creating={controls.state.creating} failure={controls.state.createFailure} onCreate={controls.create} />
    </>
  );
}
