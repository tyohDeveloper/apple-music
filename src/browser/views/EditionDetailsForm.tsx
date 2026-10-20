import editionKinds from "../../../data/taxonomies/edition-kinds.json" with { type: "json" };
import type { EditionDetail } from "../../contracts/editions/editionDetailSchema.ts";
import type { EditionEditorControls } from "../controllers/useEditionEditor.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { DeleteConfirmation } from "./DeleteConfirmation.tsx";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type EditionDetailsFormProps = { readonly messages: Messages; readonly edition: EditionDetail; readonly controls: EditionEditorControls };

export function EditionDetailsForm({ messages, edition, controls }: EditionDetailsFormProps) {
  const { t } = messages;
  return (
    <form key={edition.id} class="panel stack" data-testid="panel-edition-details" onSubmit={(event) => controls.save(formValuesOf(event))}>
      <h2>{t("edition.details")}</h2>
      <label class="field">
        <span>{t("edition.title")}</span>
        <input name="title" required maxLength={300} defaultValue={edition.title} data-testid="input-edition-title" />
      </label>
      <div class="field-row">
        <label class="field">
          <span>{t("edition.kind")}</span>
          <select name="kind" data-testid="select-edition-kind">
            <TaxonomyOptions messages={messages} taxonomy={editionKinds} selected={edition.kind} />
          </select>
        </label>
        <label class="field">
          <span>{t("edition.released")}</span>
          <input name="released" maxLength={10} defaultValue={edition.released ?? ""} data-testid="input-edition-released" />
        </label>
      </div>
      <label class="field">
        <span>{t("edition.notes")}</span>
        <textarea name="notes" rows={3} maxLength={10000} defaultValue={edition.notes ?? ""} data-testid="input-edition-notes" />
      </label>
      <div class="actions">
        <button type="submit" disabled={controls.state.saving} data-testid="button-edition-save">{t("edition.save")}</button>
        <DeleteConfirmation labels={{ request: t("edition.delete"), confirm: t("edition.delete.confirm"), cancel: t("edition.delete.cancel") }} controls={controls} />
      </div>
    </form>
  );
}
