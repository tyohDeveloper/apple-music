// Adds a performer to the credits being edited: find the performer, choose it and a role.
import creditRoles from "../../../data/taxonomies/credit-roles.json" with { type: "json" };
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { CreditDraftControls } from "../controllers/useCreditDraft.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerPickerControls } from "../controllers/usePerformerPicker.ts";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type CreditAddFormProps = { readonly messages: Messages; readonly credits: CreditDraftControls; readonly picker: PerformerPickerControls };

export function CreditAddForm({ messages, credits, picker }: CreditAddFormProps) {
  const { t } = messages;
  const { results } = picker.state;
  return (
    <div class="stack inline-form">
      <h3>{t("credits.add.heading")}</h3>
      <form class="search-form" data-testid="panel-credits-find" onSubmit={(event) => picker.search(formValuesOf(event))}>
        <label class="field">
          <span>{t("credits.add.query")}</span>
          <input name="query" type="search" maxLength={200} data-testid="input-credits-query" />
        </label>
        <button type="submit" class="secondary" data-testid="button-credits-find">{t("credits.add.find")}</button>
      </form>
      {picker.state.status === "loaded" && results.length === 0 && <p data-testid="display-credits-noresults">{t("credits.add.noResults")}</p>}
      <form class="stack" data-testid="panel-credits-add" onSubmit={(event) => credits.add(formValuesOf(event), results)}>
        <div class="field-row">
          <label class="field">
            <span>{t("credits.add.performer")}</span>
            <select name="performerId" required data-testid="select-credits-performer">
              {results.map((result) => (
                <option key={result.id} value={result.id}>{result.name}</option>
              ))}
            </select>
          </label>
          <label class="field">
            <span>{t("credits.add.role")}</span>
            <select name="role" data-testid="select-credits-role">
              <TaxonomyOptions messages={messages} taxonomy={creditRoles} />
            </select>
          </label>
        </div>
        <button type="submit" class="secondary" disabled={results.length === 0} data-testid="button-credits-add">{t("credits.add.submit")}</button>
      </form>
    </div>
  );
}
