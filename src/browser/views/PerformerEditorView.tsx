import { preferredNameOf } from "../../names/preferredNameOf.ts";
import type { CreditedRecordingsControls } from "../controllers/useCreditedRecordings.ts";
import type { LinkedAlbumsControls } from "../controllers/useLinkedAlbums.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerEditorControls } from "../controllers/usePerformerEditor.ts";
import type { PerformerPickerControls } from "../controllers/usePerformerPicker.ts";
import { CreditedRecordingsPanel } from "./CreditedRecordingsPanel.tsx";
import { LinkedAlbumsPanel } from "./LinkedAlbumsPanel.tsx";
import { PerformerDetailsForm } from "./PerformerDetailsForm.tsx";
import { PerformerNamesPanel } from "./PerformerNamesPanel.tsx";
import { PerformerRelationsPanel } from "./PerformerRelationsPanel.tsx";

type PerformerEditorViewProps = {
  readonly messages: Messages;
  readonly controls: PerformerEditorControls;
  readonly picker: PerformerPickerControls;
  readonly credited: CreditedRecordingsControls;
  readonly albums: LinkedAlbumsControls;
  readonly onBack: () => void;
  readonly onOpenPerformer: (performerId: string) => void;
  readonly onOpenRecording: (recordingId: string) => void;
  readonly onOpenAlbum: (albumId: string) => void;
};

export function PerformerEditorView({ messages, controls, picker, credited, albums, onBack, onOpenPerformer, onOpenRecording, onOpenAlbum }: PerformerEditorViewProps) {
  const { t } = messages;
  const { state } = controls;
  const performer = state.entity;
  return (
    <>
      <section class="panel" aria-labelledby="performer-heading">
        <button type="button" class="link-button" data-testid="button-performer-back" onClick={onBack}>
          {t("performer.back")}
        </button>
        <h1 id="performer-heading" data-testid="text-performer-name">{performer === null ? t("performer.heading") : preferredNameOf(performer.names)}</h1>
        {state.status === "loading" && <p data-testid="display-performer-loading">{t("app.loading")}</p>}
        {state.failure !== null && <p role="alert" class="error" data-testid="display-performer-error">{messages.errorMessage(state.failure)}</p>}
        {state.saveFailure !== null && (
          <p role="alert" class="error" data-testid="display-performer-save-error">{messages.errorMessage(state.saveFailure)}</p>
        )}
      </section>
      {performer !== null && (
        <>
          <PerformerDetailsForm messages={messages} performer={performer} controls={controls} />
          <PerformerNamesPanel messages={messages} names={performer.names} controls={controls} />
          <PerformerRelationsPanel messages={messages} relations={performer.relations} controls={controls} picker={picker} onOpenPerformer={onOpenPerformer} />
          <CreditedRecordingsPanel messages={messages} controls={credited} onOpenRecording={onOpenRecording} />
          <LinkedAlbumsPanel messages={messages} heading={t("performer.albums.heading")} empty={t("performer.albums.empty")} controls={albums} onOpenAlbum={onOpenAlbum} />
        </>
      )}
    </>
  );
}
