import type { GenrePickerControls } from "../controllers/useGenrePicker.ts";
import type { LinkedAlbumsControls } from "../controllers/useLinkedAlbums.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerPickerControls } from "../controllers/usePerformerPicker.ts";
import type { RecordingEditorControls } from "../controllers/useRecordingEditor.ts";
import { CreditsPanel } from "./CreditsPanel.tsx";
import { ExternalIdsPanel } from "./ExternalIdsPanel.tsx";
import { GenresPanel } from "./GenresPanel.tsx";
import { LinkedAlbumsPanel } from "./LinkedAlbumsPanel.tsx";
import { RecordingDetailsForm } from "./RecordingDetailsForm.tsx";

type RecordingEditorViewProps = {
  readonly messages: Messages;
  readonly controls: RecordingEditorControls;
  readonly picker: PerformerPickerControls;
  readonly genrePicker: GenrePickerControls;
  readonly albums: LinkedAlbumsControls;
  readonly onBack: () => void;
  readonly onOpenPerformer: (performerId: string) => void;
  readonly onOpenAlbum: (albumId: string) => void;
  readonly onOpenGenre: (genreId: string) => void;
};

export function RecordingEditorView(props: RecordingEditorViewProps) {
  const { messages, controls, picker, albums, onBack, onOpenPerformer, onOpenAlbum } = props;
  const { t } = messages;
  const { state } = controls;
  const recording = state.entity;
  return (
    <>
      <section class="panel" aria-labelledby="recording-heading">
        <button type="button" class="link-button" data-testid="button-recording-back" onClick={onBack}>
          {t("recording.back")}
        </button>
        <h1 id="recording-heading" data-testid="text-recording-title">{recording === null ? t("recording.heading") : recording.title}</h1>
        {recording !== null && recording.creditLine !== "" && <p class="muted" data-testid="text-recording-creditline">{recording.creditLine}</p>}
        {state.status === "loading" && <p data-testid="display-recording-loading">{t("app.loading")}</p>}
        {state.failure !== null && <p role="alert" class="error" data-testid="display-recording-error">{messages.errorMessage(state.failure)}</p>}
        {state.saveFailure !== null && (
          <p role="alert" class="error" data-testid="display-recording-save-error">{messages.errorMessage(state.saveFailure)}</p>
        )}
      </section>
      {recording !== null && (
        <>
          <RecordingDetailsForm messages={messages} recording={recording} controls={controls} />
          <CreditsPanel
            messages={messages}
            stored={recording.credits}
            credits={controls.credits}
            picker={picker}
            saving={state.saving}
            onSave={controls.saveCredits}
            onOpenPerformer={onOpenPerformer}
          />
          <GenresPanel messages={messages} genres={recording.genres} saving={state.saving} controls={controls.genres} picker={props.genrePicker} onOpenGenre={props.onOpenGenre} />
          <ExternalIdsPanel messages={messages} owner="recording" externalIds={recording.externalIds} saving={state.saving} controls={controls.externalIds} />
          <LinkedAlbumsPanel messages={messages} heading={t("recording.albums.heading")} empty={t("recording.albums.empty")} controls={albums} onOpenAlbum={onOpenAlbum} />
        </>
      )}
    </>
  );
}
