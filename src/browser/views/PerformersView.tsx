import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerListControls } from "../controllers/usePerformerList.ts";
import { pageRangeOf } from "../state/catalog/catalogListReducer.ts";
import { CatalogPager } from "./CatalogPager.tsx";
import { PerformerCard } from "./PerformerCard.tsx";
import { PerformerCreateForm } from "./PerformerCreateForm.tsx";

type PerformersViewProps = {
  readonly messages: Messages;
  readonly controls: PerformerListControls;
  readonly onBack: () => void;
  readonly onOpen: (performerId: string) => void;
};

function PerformerResults({ messages, controls, onOpen }: Omit<PerformersViewProps, "onBack">) {
  const { t } = messages;
  const { state } = controls;
  const range = pageRangeOf(state);
  return (
    <>
      {state.status === "loading" && <p data-testid="display-performers-loading">{t("app.loading")}</p>}
      {state.failure !== null && <p role="alert" class="error" data-testid="display-performers-error">{messages.errorMessage(state.failure)}</p>}
      {state.status === "loaded" && range.total === 0 && <p data-testid="display-performers-empty">{t("performers.empty")}</p>}
      <ul class="card-list" data-testid="panel-performers-results">
        {state.items.map((performer) => (
          <li key={performer.id}>
            <PerformerCard messages={messages} performer={performer} onOpen={onOpen} />
          </li>
        ))}
      </ul>
      <CatalogPager messages={messages} list="performers" range={range} onPrevious={controls.showPrevious} onNext={controls.showNext} />
    </>
  );
}

export function PerformersView({ messages, controls, onBack, onOpen }: PerformersViewProps) {
  const { t } = messages;
  return (
    <>
      <section class="panel" aria-labelledby="performers-heading">
        <button type="button" class="link-button" data-testid="button-performers-back" onClick={onBack}>
          {t("performers.back")}
        </button>
        <h1 id="performers-heading">{t("performers.heading")}</h1>
        <form class="search-form" data-testid="panel-performers-search" onSubmit={(event) => controls.search(formValuesOf(event))}>
          <label class="field">
            <span>{t("performers.search.label")}</span>
            <input name="query" type="search" maxLength={200} defaultValue={controls.state.query} data-testid="input-performers-query" />
          </label>
          <button type="submit" data-testid="button-performers-search">{t("performers.search.submit")}</button>
        </form>
        <PerformerResults messages={messages} controls={controls} onOpen={onOpen} />
      </section>
      <PerformerCreateForm messages={messages} creating={controls.state.creating} failure={controls.state.createFailure} onCreate={controls.create} />
    </>
  );
}
