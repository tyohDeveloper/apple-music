import performerKinds from "../../../data/taxonomies/performer-kinds.json" with { type: "json" };
import { formValuesOf, type FormValues } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type PerformerCreateFormProps = {
  readonly messages: Messages;
  readonly creating: boolean;
  readonly failure: string | null;
  readonly onCreate: (values: FormValues) => void;
};

export function PerformerCreateForm({ messages, creating, failure, onCreate }: PerformerCreateFormProps) {
  const { t } = messages;
  return (
    <form class="panel stack" data-testid="panel-performers-create" onSubmit={(event) => onCreate(formValuesOf(event))}>
      <h2>{t("performers.create.heading")}</h2>
      <label class="field">
        <span>{t("performers.create.kind")}</span>
        <select name="kind" required data-testid="select-performers-kind">
          <TaxonomyOptions messages={messages} taxonomy={performerKinds} />
        </select>
      </label>
      <label class="field">
        <span>{t("performers.create.name")}</span>
        <input name="name" required maxLength={300} data-testid="input-performers-name" />
      </label>
      <label class="field">
        <span>{t("performers.create.sortName")}</span>
        <input name="sortName" maxLength={300} data-testid="input-performers-sortname" />
      </label>
      {failure !== null && (
        <p role="alert" class="error" data-testid="display-performers-create-error">{messages.errorMessage(failure)}</p>
      )}
      <button type="submit" disabled={creating} data-testid="button-performers-create">
        {t("performers.create.submit")}
      </button>
    </form>
  );
}
