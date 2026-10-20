import type { EditionEditorControls } from "../controllers/useEditionEditor.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { RecordingPickerControls } from "../controllers/useRecordingPicker.ts";
import { EditionDetailsForm } from "./EditionDetailsForm.tsx";
import { EditionTracksPanel } from "./EditionTracksPanel.tsx";

type EditionEditorViewProps = {
  readonly messages: Messages;
  readonly controls: EditionEditorControls;
  readonly picker: RecordingPickerControls;
  readonly onOpenAlbum: (albumId: string) => void;
  readonly onOpenRecording: (recordingId: string) => void;
};

export function EditionEditorView({ messages, controls, picker, onOpenAlbum, onOpenRecording }: EditionEditorViewProps) {
  const { t } = messages;
  const { state } = controls;
  const edition = state.entity;
  return (
    <>
      <section class="panel" aria-labelledby="edition-heading">
        {edition !== null && (
          <button type="button" class="link-button" data-testid="button-edition-album" onClick={() => onOpenAlbum(edition.album.id)}>
            {t("edition.album", { title: edition.album.title })}
          </button>
        )}
        <h1 id="edition-heading" data-testid="text-edition-title">{edition === null ? t("edition.heading") : edition.title}</h1>
        {state.status === "loading" && <p data-testid="display-edition-loading">{t("app.loading")}</p>}
        {state.failure !== null && <p role="alert" class="error" data-testid="display-edition-error">{messages.errorMessage(state.failure)}</p>}
        {state.saveFailure !== null && <p role="alert" class="error" data-testid="display-edition-save-error">{messages.errorMessage(state.saveFailure)}</p>}
      </section>
      {edition !== null && (
        <>
          <EditionDetailsForm messages={messages} edition={edition} controls={controls} />
          <EditionTracksPanel messages={messages} stored={edition.tracks} controls={controls} picker={picker} onOpenRecording={onOpenRecording} />
        </>
      )}
    </>
  );
}
