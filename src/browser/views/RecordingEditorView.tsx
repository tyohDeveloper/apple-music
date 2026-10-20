import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerPickerControls } from "../controllers/usePerformerPicker.ts";
import type { RecordingEditorControls } from "../controllers/useRecordingEditor.ts";
import { CreditsPanel } from "./CreditsPanel.tsx";
import { RecordingDetailsForm } from "./RecordingDetailsForm.tsx";

type RecordingEditorViewProps = {
  readonly messages: Messages;
  readonly controls: RecordingEditorControls;
  readonly picker: PerformerPickerControls;
  readonly onBack: () => void;
  readonly onOpenPerformer: (performerId: string) => void;
};

export function RecordingEditorView({ messages, controls, picker, onBack, onOpenPerformer }: RecordingEditorViewProps) {
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
        </>
      )}
    </>
  );
}
