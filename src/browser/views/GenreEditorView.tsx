// One genre: where it sits in the tree, its details, aliases, place and subgenres, and the
// albums, recordings and performers that carry it.
import type { GenreEditorControls } from "../controllers/useGenreEditor.ts";
import type { GenrePickerControls } from "../controllers/useGenrePicker.ts";
import type { LinkedAlbumsControls } from "../controllers/useLinkedAlbums.ts";
import type { LinkedPerformersControls } from "../controllers/useLinkedPerformers.ts";
import type { LinkedRecordingsControls } from "../controllers/useLinkedRecordings.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { GenreAliasesPanel } from "./GenreAliasesPanel.tsx";
import { GenreDetailsForm } from "./GenreDetailsForm.tsx";
import { GenrePlacementPanel, SubgenresPanel } from "./GenreTreePanels.tsx";
import { LinkedAlbumsPanel } from "./LinkedAlbumsPanel.tsx";
import { LinkedPerformersPanel } from "./LinkedPerformersPanel.tsx";
import { LinkedRecordingsPanel } from "./LinkedRecordingsPanel.tsx";

type GenreNavigation = {
  readonly onBack: () => void;
  readonly onOpenGenre: (genreId: string) => void;
  readonly onOpenAlbum: (albumId: string) => void;
  readonly onOpenRecording: (recordingId: string) => void;
  readonly onOpenPerformer: (performerId: string) => void;
};

type GenreUses = { readonly albums: LinkedAlbumsControls; readonly recordings: LinkedRecordingsControls; readonly performers: LinkedPerformersControls };

type GenreEditorViewProps = GenreNavigation & {
  readonly messages: Messages;
  readonly controls: GenreEditorControls;
  readonly picker: GenrePickerControls;
  readonly uses: GenreUses;
};

function GenreHeader({ messages, controls, onBack, onOpenGenre }: Pick<GenreEditorViewProps, "messages" | "controls" | "onBack" | "onOpenGenre">) {
  const { t } = messages;
  const { state } = controls;
  const genre = state.entity;
  return (
    <section class="panel" aria-labelledby="genre-heading">
      <button type="button" class="link-button" data-testid="button-genre-back" onClick={onBack}>{t("genre.back")}</button>
      {genre !== null && genre.path.length > 0 && (
        <p class="muted" data-testid="display-genre-path">
          {genre.path.map((ancestor, index) => (
            <span key={ancestor.id}>
              {index > 0 && t("genres.pathSeparator")}
              <button type="button" class="link-button" data-testid={`button-genre-ancestor-${index}`} onClick={() => onOpenGenre(ancestor.id)}>{ancestor.name}</button>
            </span>
          ))}
        </p>
      )}
      <h1 id="genre-heading" data-testid="text-genre-name">{genre === null ? t("genre.heading") : genre.name}</h1>
      {state.status === "loading" && <p data-testid="display-genre-loading">{t("app.loading")}</p>}
      {state.failure !== null && <p role="alert" class="error" data-testid="display-genre-error">{messages.errorMessage(state.failure)}</p>}
      {state.saveFailure !== null && <p role="alert" class="error" data-testid="display-genre-save-error">{messages.errorMessage(state.saveFailure)}</p>}
    </section>
  );
}

export function GenreEditorView(props: GenreEditorViewProps) {
  const { messages, controls, picker, uses } = props;
  const { t } = messages;
  const genre = controls.state.entity;
  return (
    <>
      <GenreHeader {...props} />
      {genre !== null && (
        <>
          <GenreDetailsForm messages={messages} genre={genre} controls={controls} />
          <GenreAliasesPanel messages={messages} genre={genre} controls={controls} />
          <GenrePlacementPanel messages={messages} genre={genre} controls={controls} picker={picker} onOpenGenre={props.onOpenGenre} />
          <SubgenresPanel messages={messages} genre={genre} controls={controls} onOpenGenre={props.onOpenGenre} />
          <LinkedAlbumsPanel messages={messages} heading={t("genre.albums.heading")} empty={t("genre.albums.empty")} controls={uses.albums} onOpenAlbum={props.onOpenAlbum} />
          <LinkedRecordingsPanel messages={messages} heading={t("genre.recordings.heading")} empty={t("genre.recordings.empty")} controls={uses.recordings} onOpenRecording={props.onOpenRecording} />
          <LinkedPerformersPanel messages={messages} heading={t("genre.performers.heading")} empty={t("genre.performers.empty")} controls={uses.performers} onOpenPerformer={props.onOpenPerformer} />
        </>
      )}
    </>
  );
}
