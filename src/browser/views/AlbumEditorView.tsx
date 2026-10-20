import type { AlbumEditorControls } from "../controllers/useAlbumEditor.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerPickerControls } from "../controllers/usePerformerPicker.ts";
import type { RecordingPickerControls } from "../controllers/useRecordingPicker.ts";
import { AlbumDetailsForm } from "./AlbumDetailsForm.tsx";
import { AlbumTracksPanel } from "./AlbumTracksPanel.tsx";
import { CreditsPanel } from "./CreditsPanel.tsx";
import { EditionsPanel } from "./EditionsPanel.tsx";

type AlbumNavigation = {
  readonly onBack: () => void;
  readonly onOpenPerformer: (performerId: string) => void;
  readonly onOpenRecording: (recordingId: string) => void;
  readonly onOpenEdition: (editionId: string) => void;
};

type AlbumEditorViewProps = AlbumNavigation & {
  readonly messages: Messages;
  readonly controls: AlbumEditorControls;
  readonly performerPicker: PerformerPickerControls;
  readonly recordingPicker: RecordingPickerControls;
};

export function AlbumEditorView(props: AlbumEditorViewProps) {
  const { messages, controls, performerPicker, recordingPicker } = props;
  const { t } = messages;
  const { state } = controls;
  const album = state.entity;
  return (
    <>
      <section class="panel" aria-labelledby="album-heading">
        <button type="button" class="link-button" data-testid="button-album-back" onClick={props.onBack}>{t("album.back")}</button>
        <h1 id="album-heading" data-testid="text-album-title">{album === null ? t("album.heading") : album.title}</h1>
        {album !== null && album.creditLine !== "" && <p class="muted" data-testid="text-album-creditline">{album.creditLine}</p>}
        {state.status === "loading" && <p data-testid="display-album-loading">{t("app.loading")}</p>}
        {state.failure !== null && <p role="alert" class="error" data-testid="display-album-error">{messages.errorMessage(state.failure)}</p>}
        {state.saveFailure !== null && <p role="alert" class="error" data-testid="display-album-save-error">{messages.errorMessage(state.saveFailure)}</p>}
      </section>
      {album !== null && (
        <>
          <AlbumDetailsForm messages={messages} album={album} controls={controls} />
          <CreditsPanel messages={messages} stored={album.credits} credits={controls.credits} picker={performerPicker} saving={state.saving} onSave={controls.saveCredits} onOpenPerformer={props.onOpenPerformer} />
          <AlbumTracksPanel messages={messages} stored={album.tracks} controls={controls} picker={recordingPicker} onOpenRecording={props.onOpenRecording} />
          <EditionsPanel messages={messages} album={album} controls={controls} onOpenEdition={props.onOpenEdition} />
        </>
      )}
    </>
  );
}
