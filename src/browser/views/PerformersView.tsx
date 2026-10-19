import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerListControls } from "../controllers/usePerformerList.ts";
import { pageRangeOf } from "../state/performers/performerListReducer.ts";
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
            <button type="button" class="card" data-testid={`button-performers-open-${performer.id}`} onClick={() => onOpen(performer.id)}>
              <span class="card-title">{performer.name}</span>
              <span class="card-meta">{messages.displayName("performerKind", performer.kind)}</span>
              {performer.disambiguation !== null && <span class="card-meta">{performer.disambiguation}</span>}
            </button>
          </li>
        ))}
      </ul>
      {range.total > 0 && (
        <div class="pager">
          <button type="button" class="secondary" disabled={!range.hasPrevious} data-testid="button-performers-previous" onClick={controls.showPrevious}>
            {t("pager.previous")}
          </button>
          <span data-testid="display-performers-range">
            {t("pager.range", { from: messages.number(range.from), to: messages.number(range.to), total: messages.number(range.total) })}
          </span>
          <button type="button" class="secondary" disabled={!range.hasNext} data-testid="button-performers-next" onClick={controls.showNext}>
            {t("pager.next")}
          </button>
        </div>
      )}
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
