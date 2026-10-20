// The external identifiers of a performer, album, edition or recording: namespace and
// value, linked to the namespace's page where it has one. Each change is saved at once.
import type { ExternalId } from "../../contracts/identifiers/externalIdSchema.ts";
import type { ExternalIdOwner } from "../../identifiers/externalIdFormatOf.ts";
import { externalIdLinkOf } from "../../identifiers/externalIdLinkOf.ts";
import { namespacesOf } from "../../identifiers/namespacesOf.ts";
import type { ExternalIdAssignmentControls } from "../controllers/externalIdAssignmentOf.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";

type ExternalIdsPanelProps = {
  readonly messages: Messages;
  readonly owner: ExternalIdOwner;
  readonly externalIds: readonly ExternalId[];
  readonly saving: boolean;
  readonly controls: ExternalIdAssignmentControls;
};

type ExternalIdValueProps = { readonly owner: ExternalIdOwner; readonly externalId: ExternalId; readonly index: number };

function ExternalIdValue({ owner, externalId, index }: ExternalIdValueProps) {
  const link = externalIdLinkOf(owner, externalId.namespace, externalId.value);
  if (link === null) return <code>{externalId.value}</code>;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" data-testid={`button-identifiers-open-${index}`}>
      <code>{externalId.value}</code>
    </a>
  );
}

// The form keeps what was typed until the identifier is saved. A value without its
// namespace's form is flagged on the field, and any later edit of the form clears the flag.
function valueInputOf(event: Event): HTMLInputElement {
  return (event.currentTarget as HTMLFormElement).elements.namedItem("value") as HTMLInputElement;
}

function addFrom(event: SubmitEvent, controls: ExternalIdAssignmentControls, messages: Messages): void {
  const [form, input] = [event.currentTarget as HTMLFormElement, valueInputOf(event)];
  const onRefused = (failure: string): void => {
    input.setCustomValidity(messages.errorMessage(failure));
    input.reportValidity();
  };
  controls.add(formValuesOf(event), { onAdded: () => form.reset(), onRefused });
}

export function ExternalIdsPanel({ messages, owner, externalIds, saving, controls }: ExternalIdsPanelProps) {
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="identifiers-heading">
      <h2 id="identifiers-heading">{t("identifiers.heading")}</h2>
      {externalIds.length === 0 && <p data-testid="display-identifiers-empty">{t("identifiers.empty")}</p>}
      <ul class="rows" data-testid="panel-identifiers-list">
        {externalIds.map((externalId, index) => (
          <li key={`${externalId.namespace} ${externalId.value}`} class="row">
            <span class="row-main" data-testid={`display-identifiers-value-${index}`}>
              <span class="muted">{messages.displayName("externalIdNamespace", externalId.namespace)}</span>
              <ExternalIdValue owner={owner} externalId={externalId} index={index} />
            </span>
            <span class="row-actions">
              <button type="button" class="secondary" disabled={saving} data-testid={`button-identifiers-remove-${index}`} onClick={() => controls.remove(index)}>{t("identifiers.remove")}</button>
            </span>
          </li>
        ))}
      </ul>
      <form
        class="stack inline-form"
        data-testid="panel-identifiers-add"
        onSubmit={(event) => addFrom(event, controls, messages)}
        onInput={(event) => valueInputOf(event).setCustomValidity("")}
      >
        <div class="field-row">
          <label class="field">
            <span>{t("identifiers.add.namespace")}</span>
            <select name="namespace" data-testid="select-identifiers-namespace">
              {namespacesOf(owner).map((namespace) => (
                <option key={namespace} value={namespace}>{messages.displayName("externalIdNamespace", namespace)}</option>
              ))}
            </select>
          </label>
          <label class="field">
            <span>{t("identifiers.add.value")}</span>
            <input name="value" required maxLength={100} data-testid="input-identifiers-value" />
          </label>
        </div>
        <button type="submit" class="secondary" disabled={saving} data-testid="button-identifiers-add">{t("identifiers.add.submit")}</button>
      </form>
    </section>
  );
}
