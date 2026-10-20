import recordingKinds from "../../../data/taxonomies/recording-kinds.json" with { type: "json" };
import { formValuesOf, type FormValues } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type RecordingCreateFormProps = {
  readonly messages: Messages;
  readonly creating: boolean;
  readonly failure: string | null;
  readonly onCreate: (values: FormValues) => void;
};

export function RecordingCreateForm({ messages, creating, failure, onCreate }: RecordingCreateFormProps) {
  const { t } = messages;
  return (
    <form class="panel stack" data-testid="panel-recordings-create" onSubmit={(event) => onCreate(formValuesOf(event))}>
      <h2>{t("recordings.create.heading")}</h2>
      <label class="field">
        <span>{t("recordings.create.title")}</span>
        <input name="title" required maxLength={300} data-testid="input-recordings-title" />
      </label>
      <div class="field-row">
        <label class="field">
          <span>{t("recordings.create.kind")}</span>
          <select name="kind" required data-testid="select-recordings-kind">
            <TaxonomyOptions messages={messages} taxonomy={recordingKinds} />
          </select>
        </label>
        <label class="field">
          <span>{t("recordings.create.versionNote")}</span>
          <input name="versionNote" maxLength={300} data-testid="input-recordings-versionnote" />
        </label>
      </div>
      {failure !== null && (
        <p role="alert" class="error" data-testid="display-recordings-create-error">{messages.errorMessage(failure)}</p>
      )}
      <button type="submit" disabled={creating} data-testid="button-recordings-create">
        {t("recordings.create.submit")}
      </button>
    </form>
  );
}
