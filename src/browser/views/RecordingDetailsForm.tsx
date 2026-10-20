import recordingKinds from "../../../data/taxonomies/recording-kinds.json" with { type: "json" };
import type { RecordingDetail } from "../../contracts/recordings/recordingDetailSchema.ts";
import { durationTextOf } from "../../forms/durationTextOf.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { RecordingEditorControls } from "../controllers/useRecordingEditor.ts";
import { DeleteConfirmation } from "./DeleteConfirmation.tsx";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type RecordingDetailsFormProps = { readonly messages: Messages; readonly recording: RecordingDetail; readonly controls: RecordingEditorControls };

const durationPattern = String.raw`\d+(:[0-5]\d){1,2}(\.\d{1,3})?`;

function RecordedFields({ messages, recording }: Omit<RecordingDetailsFormProps, "controls">) {
  const { t } = messages;
  return (
    <>
      <div class="field-row">
        <label class="field">
          <span>{t("recording.recordedFrom")}</span>
          <input name="recordedFrom" maxLength={10} defaultValue={recording.recordedFrom ?? ""} data-testid="input-recording-recordedfrom" />
        </label>
        <label class="field">
          <span>{t("recording.recordedTo")}</span>
          <input name="recordedTo" maxLength={10} defaultValue={recording.recordedTo ?? ""} data-testid="input-recording-recordedto" />
        </label>
      </div>
      <p class="hint">{t("dates.hint")}</p>
      <div class="field-row">
        <label class="field">
          <span>{t("recording.venue")}</span>
          <input name="venue" maxLength={300} defaultValue={recording.venue ?? ""} data-testid="input-recording-venue" />
        </label>
        <label class="field">
          <span>{t("recording.duration")}</span>
          <input name="duration" maxLength={16} pattern={durationPattern} defaultValue={durationTextOf(recording.durationMs)} data-testid="input-recording-duration" />
        </label>
      </div>
    </>
  );
}

export function RecordingDetailsForm({ messages, recording, controls }: RecordingDetailsFormProps) {
  const { t } = messages;
  return (
    <form key={recording.id} class="panel stack" data-testid="panel-recording-details" onSubmit={(event) => controls.save(formValuesOf(event))}>
      <h2>{t("recording.details")}</h2>
      <label class="field">
        <span>{t("recording.title")}</span>
        <input name="title" required maxLength={300} defaultValue={recording.title} data-testid="input-recording-title" />
      </label>
      <div class="field-row">
        <label class="field">
          <span>{t("recording.kind")}</span>
          <select name="kind" defaultValue={recording.kind} data-testid="select-recording-kind">
            <TaxonomyOptions messages={messages} taxonomy={recordingKinds} />
          </select>
        </label>
        <label class="field">
          <span>{t("recording.versionNote")}</span>
          <input name="versionNote" maxLength={300} defaultValue={recording.versionNote ?? ""} data-testid="input-recording-versionnote" />
        </label>
      </div>
      <RecordedFields messages={messages} recording={recording} />
      <label class="field">
        <span>{t("recording.notes")}</span>
        <textarea name="notes" rows={4} maxLength={10000} defaultValue={recording.notes ?? ""} data-testid="input-recording-notes" />
      </label>
      <div class="actions">
        <button type="submit" disabled={controls.state.saving} data-testid="button-recording-save">{t("recording.save")}</button>
        <DeleteConfirmation labels={{ request: t("recording.delete"), confirm: t("recording.delete.confirm"), cancel: t("recording.delete.cancel") }} controls={controls} />
      </div>
    </form>
  );
}
