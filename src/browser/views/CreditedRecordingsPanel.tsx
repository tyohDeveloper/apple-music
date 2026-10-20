// The recordings that credit a performer, on the performer's page. A performer credited
// anywhere cannot be deleted, so this is where to look first.
import type { CreditedRecordingsControls } from "../controllers/useCreditedRecordings.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { pageRangeOf } from "../state/catalog/catalogListReducer.ts";
import { CatalogPager } from "./CatalogPager.tsx";
import { RecordingCard } from "./RecordingCard.tsx";

type CreditedRecordingsPanelProps = {
  readonly messages: Messages;
  readonly controls: CreditedRecordingsControls;
  readonly onOpenRecording: (recordingId: string) => void;
};

export function CreditedRecordingsPanel({ messages, controls, onOpenRecording }: CreditedRecordingsPanelProps) {
  const { t } = messages;
  const { state } = controls;
  const range = pageRangeOf(state);
  return (
    <section class="panel" aria-labelledby="credited-heading">
      <h2 id="credited-heading">{t("performer.recordings.heading")}</h2>
      {state.failure !== null && <p role="alert" class="error" data-testid="display-credited-error">{messages.errorMessage(state.failure)}</p>}
      {state.status === "loaded" && range.total === 0 && <p data-testid="display-credited-empty">{t("performer.recordings.empty")}</p>}
      <ul class="card-list" data-testid="panel-credited-results">
        {state.items.map((recording) => (
          <li key={recording.id}>
            <RecordingCard messages={messages} recording={recording} onOpen={onOpenRecording} />
          </li>
        ))}
      </ul>
      <CatalogPager messages={messages} range={range} onPrevious={controls.showPrevious} onNext={controls.showNext} />
    </section>
  );
}
