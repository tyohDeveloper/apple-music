// The performers linked to the entity on screen, such as those carrying a genre.
import type { LinkedPerformersControls } from "../controllers/useLinkedPerformers.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { pageRangeOf } from "../state/catalog/catalogListReducer.ts";
import { CatalogPager } from "./CatalogPager.tsx";
import { PerformerCard } from "./PerformerCard.tsx";

type LinkedPerformersPanelProps = {
  readonly messages: Messages;
  readonly heading: string;
  readonly empty: string;
  readonly controls: LinkedPerformersControls;
  readonly onOpenPerformer: (performerId: string) => void;
};

export function LinkedPerformersPanel({ messages, heading, empty, controls, onOpenPerformer }: LinkedPerformersPanelProps) {
  const { state } = controls;
  const range = pageRangeOf(state);
  return (
    <section class="panel" aria-labelledby="linked-performers-heading">
      <h2 id="linked-performers-heading">{heading}</h2>
      {state.failure !== null && <p role="alert" class="error" data-testid="display-linkedperformers-error">{messages.errorMessage(state.failure)}</p>}
      {state.status === "loaded" && range.total === 0 && <p data-testid="display-linkedperformers-empty">{empty}</p>}
      <ul class="card-list" data-testid="panel-linkedperformers-results">
        {state.items.map((performer) => (
          <li key={performer.id}>
            <PerformerCard messages={messages} performer={performer} onOpen={onOpenPerformer} />
          </li>
        ))}
      </ul>
      <CatalogPager messages={messages} list="linkedperformers" range={range} onPrevious={controls.showPrevious} onNext={controls.showNext} />
    </section>
  );
}
