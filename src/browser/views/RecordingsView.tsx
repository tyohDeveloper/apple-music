import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { RecordingListControls } from "../controllers/useRecordingList.ts";
import { pageRangeOf } from "../state/catalog/catalogListReducer.ts";
import { CatalogPager } from "./CatalogPager.tsx";
import { RecordingCard } from "./RecordingCard.tsx";
import { RecordingCreateForm } from "./RecordingCreateForm.tsx";

type RecordingsViewProps = {
  readonly messages: Messages;
  readonly controls: RecordingListControls;
  readonly onBack: () => void;
  readonly onOpen: (recordingId: string) => void;
};

function RecordingResults({ messages, controls, onOpen }: Omit<RecordingsViewProps, "onBack">) {
  const { t } = messages;
  const { state } = controls;
  const range = pageRangeOf(state);
  return (
    <>
      {state.status === "loading" && <p data-testid="display-recordings-loading">{t("app.loading")}</p>}
      {state.failure !== null && <p role="alert" class="error" data-testid="display-recordings-error">{messages.errorMessage(state.failure)}</p>}
      {state.status === "loaded" && range.total === 0 && <p data-testid="display-recordings-empty">{t("recordings.empty")}</p>}
      <ul class="card-list" data-testid="panel-recordings-results">
        {state.items.map((recording) => (
          <li key={recording.id}>
            <RecordingCard messages={messages} recording={recording} onOpen={onOpen} />
          </li>
        ))}
      </ul>
      <CatalogPager messages={messages} range={range} onPrevious={controls.showPrevious} onNext={controls.showNext} />
    </>
  );
}

export function RecordingsView({ messages, controls, onBack, onOpen }: RecordingsViewProps) {
  const { t } = messages;
  return (
    <>
      <section class="panel" aria-labelledby="recordings-heading">
        <button type="button" class="link-button" data-testid="button-recordings-back" onClick={onBack}>
          {t("recordings.back")}
        </button>
        <h1 id="recordings-heading">{t("recordings.heading")}</h1>
        <form class="search-form" data-testid="panel-recordings-search" onSubmit={(event) => controls.search(formValuesOf(event))}>
          <label class="field">
            <span>{t("recordings.search.label")}</span>
            <input name="query" type="search" maxLength={200} defaultValue={controls.state.query} data-testid="input-recordings-query" />
          </label>
          <button type="submit" data-testid="button-recordings-search">{t("recordings.search.submit")}</button>
        </form>
        <RecordingResults messages={messages} controls={controls} onOpen={onOpen} />
      </section>
      <RecordingCreateForm messages={messages} creating={controls.state.creating} failure={controls.state.createFailure} onCreate={controls.create} />
    </>
  );
}
