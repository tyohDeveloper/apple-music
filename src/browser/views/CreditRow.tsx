// One credit being edited: its performer, role, the name it is credited as, the text that
// joins it to the next credit, and its instruments; it can move up or down or be removed.
import creditRoles from "../../../data/taxonomies/credit-roles.json" with { type: "json" };
import type { Credit } from "../../contracts/credits/creditSchema.ts";
import { listField } from "../../forms/listField.ts";
import type { CreditDraftControls } from "../controllers/useCreditDraft.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type CreditRowProps = {
  readonly messages: Messages;
  readonly credit: Credit;
  readonly index: number;
  readonly last: boolean;
  readonly credits: CreditDraftControls;
  readonly onOpenPerformer: (performerId: string) => void;
};

const nameChoiceOf = (credit: Credit, nameId: string) => credit.performerNames.find((name) => name.id === nameId) ?? null;

function CreditNaming({ messages, credit, index, credits }: Omit<CreditRowProps, "last" | "onOpenPerformer">) {
  const { t } = messages;
  return (
    <div class="field-row">
      <label class="field">
        <span>{t("credits.role")}</span>
        <select value={credit.role} data-testid={`select-credit-role-${index}`} onChange={(event) => credits.change(index, { role: event.currentTarget.value })}>
          <TaxonomyOptions messages={messages} taxonomy={creditRoles} />
        </select>
      </label>
      <label class="field">
        <span>{t("credits.creditedAs")}</span>
        <select value={credit.creditedName?.id ?? ""} data-testid={`select-credit-name-${index}`} onChange={(event) => credits.change(index, { creditedName: nameChoiceOf(credit, event.currentTarget.value) })}>
          <option value="">{t("credits.creditedAs.preferred", { name: credit.performer.name })}</option>
          {credit.performerNames.map((name) => (
            <option key={name.id} value={name.id}>{name.name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function CreditJoining({ messages, credit, index, credits }: Omit<CreditRowProps, "last" | "onOpenPerformer">) {
  const { t } = messages;
  const joinPhraseOf = (text: string): string | null => (text === "" ? null : text);
  return (
    <div class="field-row">
      <label class="field">
        <span>{t("credits.joinPhrase")}</span>
        <input value={credit.joinPhrase ?? ""} maxLength={50} data-testid={`input-credit-join-${index}`} onInput={(event) => credits.change(index, { joinPhrase: joinPhraseOf(event.currentTarget.value) })} />
      </label>
      <label class="field">
        <span>{t("credits.instruments")}</span>
        <input key={credit.instruments.join(",")} defaultValue={credit.instruments.join(", ")} maxLength={1000} data-testid={`input-credit-instruments-${index}`} onChange={(event) => credits.change(index, { instruments: listField({ instruments: event.currentTarget.value }, "instruments") })} />
      </label>
    </div>
  );
}

export function CreditRow({ messages, credit, index, last, credits, onOpenPerformer }: CreditRowProps) {
  const { t } = messages;
  return (
    <li class="credit-row" data-testid={`panel-credit-${index}`}>
      <div class="credit-head">
        <button type="button" class="link-button" data-testid={`button-credit-performer-${index}`} onClick={() => onOpenPerformer(credit.performer.id)}>
          {credit.performer.name}
        </button>
        <span class="row-actions">
          <button type="button" class="secondary" disabled={index === 0} data-testid={`button-credit-up-${index}`} onClick={() => credits.move(index, -1)}>{t("credits.moveUp")}</button>
          <button type="button" class="secondary" disabled={last} data-testid={`button-credit-down-${index}`} onClick={() => credits.move(index, 1)}>{t("credits.moveDown")}</button>
          <button type="button" class="secondary" data-testid={`button-credit-remove-${index}`} onClick={() => credits.remove(index)}>{t("credits.remove")}</button>
        </span>
      </div>
      <CreditNaming messages={messages} credit={credit} index={index} credits={credits} />
      <CreditJoining messages={messages} credit={credit} index={index} credits={credits} />
    </li>
  );
}
