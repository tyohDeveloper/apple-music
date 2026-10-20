import performerKinds from "../../../data/taxonomies/performer-kinds.json" with { type: "json" };
import type { PerformerDetail } from "../../contracts/performers/performerDetailSchema.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerEditorControls } from "../controllers/usePerformerEditor.ts";
import { DeleteConfirmation } from "./DeleteConfirmation.tsx";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type PerformerDetailsFormProps = {
  readonly messages: Messages;
  readonly performer: PerformerDetail;
  readonly controls: PerformerEditorControls;
};

export function PerformerDetailsForm({ messages, performer, controls }: PerformerDetailsFormProps) {
  const { t } = messages;
  return (
    <form key={performer.id} class="panel stack" data-testid="panel-performer-details" onSubmit={(event) => controls.save(formValuesOf(event))}>
      <h2>{t("performer.details")}</h2>
      <label class="field">
        <span>{t("performer.kind")}</span>
        <select name="kind" defaultValue={performer.kind} data-testid="select-performer-kind">
          <TaxonomyOptions messages={messages} taxonomy={performerKinds} />
        </select>
      </label>
      <div class="field-row">
        <label class="field">
          <span>{t("performer.began")}</span>
          <input name="began" maxLength={10} defaultValue={performer.began ?? ""} data-testid="input-performer-began" />
        </label>
        <label class="field">
          <span>{t("performer.ended")}</span>
          <input name="ended" maxLength={10} defaultValue={performer.ended ?? ""} data-testid="input-performer-ended" />
        </label>
      </div>
      <p class="hint">{t("dates.hint")}</p>
      <label class="field">
        <span>{t("performer.area")}</span>
        <input name="area" maxLength={300} defaultValue={performer.area ?? ""} data-testid="input-performer-area" />
      </label>
      <label class="field">
        <span>{t("performer.disambiguation")}</span>
        <input name="disambiguation" maxLength={300} defaultValue={performer.disambiguation ?? ""} data-testid="input-performer-disambiguation" />
      </label>
      <label class="field">
        <span>{t("performer.notes")}</span>
        <textarea name="notes" rows={4} maxLength={10000} defaultValue={performer.notes ?? ""} data-testid="input-performer-notes" />
      </label>
      <div class="actions">
        <button type="submit" disabled={controls.state.saving} data-testid="button-performer-save">{t("performer.save")}</button>
        <DeleteConfirmation labels={{ request: t("performer.delete"), confirm: t("performer.delete.confirm"), cancel: t("performer.delete.cancel") }} controls={controls} />
      </div>
    </form>
  );
}
