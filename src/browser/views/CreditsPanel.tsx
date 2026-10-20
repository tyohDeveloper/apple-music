// The credits of a recording (and, later, an album) as being edited, with the credit line
// they make. Changes are saved, or discarded, as one list.
import type { Credit } from "../../contracts/credits/creditSchema.ts";
import { creditLineOf } from "../../credits/creditLineOf.ts";
import type { CreditDraftControls } from "../controllers/useCreditDraft.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerPickerControls } from "../controllers/usePerformerPicker.ts";
import { CreditAddForm } from "./CreditAddForm.tsx";
import { CreditRow } from "./CreditRow.tsx";

type CreditsPanelProps = {
  readonly messages: Messages;
  readonly stored: readonly Credit[];
  readonly credits: CreditDraftControls;
  readonly picker: PerformerPickerControls;
  readonly saving: boolean;
  readonly onSave: () => void;
  readonly onOpenPerformer: (performerId: string) => void;
};

const linePartOf = (credit: Credit) => ({ name: credit.creditedName?.name ?? credit.performer.name, role: credit.role, joinPhrase: credit.joinPhrase });

function CreditActions({ messages, stored, credits, saving, onSave }: Omit<CreditsPanelProps, "picker" | "onOpenPerformer">) {
  const { t } = messages;
  if (!credits.state.dirty) return null;
  return (
    <div class="actions">
      <span class="muted" data-testid="display-credits-unsaved">{t("credits.unsaved")}</span>
      <button type="button" disabled={saving} data-testid="button-credits-save" onClick={onSave}>{t("credits.save")}</button>
      <button type="button" class="secondary" disabled={saving} data-testid="button-credits-discard" onClick={() => credits.reset(stored)}>{t("credits.discard")}</button>
    </div>
  );
}

export function CreditsPanel(props: CreditsPanelProps) {
  const { messages, credits, picker, onOpenPerformer } = props;
  const { t } = messages;
  const line = creditLineOf(credits.state.credits.map(linePartOf));
  return (
    <section class="panel" aria-labelledby="credits-heading">
      <h2 id="credits-heading">{t("credits.heading")}</h2>
      <p data-testid="display-credits-line">{line === "" ? t("credits.lineEmpty") : t("credits.line", { line })}</p>
      {credits.state.credits.length === 0 && <p data-testid="display-credits-empty">{t("credits.empty")}</p>}
      <ol class="rows" data-testid="panel-credits-list">
        {credits.state.credits.map((credit, index) => (
          <CreditRow key={index} messages={messages} credit={credit} index={index} last={index === credits.state.credits.length - 1} credits={credits} onOpenPerformer={onOpenPerformer} />
        ))}
      </ol>
      {credits.state.credits.length > 0 && <p class="hint">{t("credits.joinPhrase.hint")}</p>}
      <CreditActions {...props} />
      <CreditAddForm messages={messages} credits={credits} picker={picker} />
    </section>
  );
}
