// The recordings linked to the entity on screen, such as those crediting a performer on the
// performer's page; a performer credited anywhere cannot be deleted, so this is where to
// look first.
import type { LinkedRecordingsControls } from "../controllers/useLinkedRecordings.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { pageRangeOf } from "../state/catalog/catalogListReducer.ts";
import { CatalogPager } from "./CatalogPager.tsx";
import { RecordingCard } from "./RecordingCard.tsx";

type LinkedRecordingsPanelProps = {
  readonly messages: Messages;
  readonly heading: string;
  readonly empty: string;
  readonly controls: LinkedRecordingsControls;
  readonly onOpenRecording: (recordingId: string) => void;
};

export function LinkedRecordingsPanel({ messages, heading, empty, controls, onOpenRecording }: LinkedRecordingsPanelProps) {
  const { state } = controls;
  const range = pageRangeOf(state);
  return (
    <section class="panel" aria-labelledby="linked-recordings-heading">
      <h2 id="linked-recordings-heading">{heading}</h2>
      {state.failure !== null && <p role="alert" class="error" data-testid="display-linkedrecordings-error">{messages.errorMessage(state.failure)}</p>}
      {state.status === "loaded" && range.total === 0 && <p data-testid="display-linkedrecordings-empty">{empty}</p>}
      <ul class="card-list" data-testid="panel-linkedrecordings-results">
        {state.items.map((recording) => (
          <li key={recording.id}>
            <RecordingCard messages={messages} recording={recording} onOpen={onOpenRecording} />
          </li>
        ))}
      </ul>
      <CatalogPager messages={messages} list="linkedrecordings" range={range} onPrevious={controls.showPrevious} onNext={controls.showNext} />
    </section>
  );
}
