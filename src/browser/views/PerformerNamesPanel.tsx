import performerNameKinds from "../../../data/taxonomies/performer-name-kinds.json" with { type: "json" };
import type { PerformerName } from "../../contracts/performers/performerNameSchema.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerEditorControls } from "../controllers/usePerformerEditor.ts";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type PerformerNamesPanelProps = {
  readonly messages: Messages;
  readonly names: readonly PerformerName[];
  readonly controls: PerformerEditorControls;
};

function NameRow({ messages, name, controls }: { readonly messages: Messages; readonly name: PerformerName; readonly controls: PerformerEditorControls }) {
  const { t } = messages;
  return (
    <li class="row">
      <span class="row-main">
        <strong>{name.name}</strong>
        <span class="muted">{messages.displayName("performerNameKind", name.kind)}</span>
        <span class="muted">{t("names.sortsAs", { sortName: name.sortName })}</span>
        {name.validFrom !== null && name.validTo !== null && (
          <span class="muted">{t("names.inUse", { from: name.validFrom, to: name.validTo })}</span>
        )}
        {name.validFrom !== null && name.validTo === null && <span class="muted">{t("names.inUseFrom", { from: name.validFrom })}</span>}
        {name.validFrom === null && name.validTo !== null && <span class="muted">{t("names.inUseUntil", { to: name.validTo })}</span>}
      </span>
      {name.isPreferred ? (
        <span class="badge" data-testid={`display-names-preferred-${name.id}`}>{t("names.preferred")}</span>
      ) : (
        <span class="row-actions">
          <button type="button" class="secondary" disabled={controls.state.saving} data-testid={`button-names-prefer-${name.id}`} onClick={() => controls.preferName(name.id)}>
            {t("names.prefer")}
          </button>
          <button type="button" class="secondary" disabled={controls.state.saving} data-testid={`button-names-remove-${name.id}`} onClick={() => controls.removeName(name.id)}>
            {t("names.remove")}
          </button>
        </span>
      )}
    </li>
  );
}

function NameForm({ messages, controls }: Omit<PerformerNamesPanelProps, "names">) {
  const { t } = messages;
  return (
    <form class="stack inline-form" data-testid="panel-names-add" onSubmit={(event) => controls.addName(formValuesOf(event, true))}>
      <h3>{t("names.add.heading")}</h3>
      <div class="field-row">
        <label class="field">
          <span>{t("names.add.name")}</span>
          <input name="name" required maxLength={300} data-testid="input-names-name" />
        </label>
        <label class="field">
          <span>{t("names.add.kind")}</span>
          <select name="kind" data-testid="select-names-kind">
            <TaxonomyOptions messages={messages} taxonomy={performerNameKinds} />
          </select>
        </label>
      </div>
      <div class="field-row">
        <label class="field">
          <span>{t("names.add.sortName")}</span>
          <input name="sortName" maxLength={300} data-testid="input-names-sortname" />
        </label>
        <label class="field">
          <span>{t("names.add.locale")}</span>
          <input name="locale" maxLength={35} data-testid="input-names-locale" />
        </label>
      </div>
      <div class="field-row">
        <label class="field">
          <span>{t("names.add.validFrom")}</span>
          <input name="validFrom" maxLength={10} data-testid="input-names-validfrom" />
        </label>
        <label class="field">
          <span>{t("names.add.validTo")}</span>
          <input name="validTo" maxLength={10} data-testid="input-names-validto" />
        </label>
      </div>
      <label class="check">
        <input type="checkbox" name="isPreferred" data-testid="checkbox-names-preferred" />
        <span>{t("names.add.isPreferred")}</span>
      </label>
      <button type="submit" disabled={controls.state.saving} data-testid="button-names-add">{t("names.add.submit")}</button>
    </form>
  );
}

export function PerformerNamesPanel({ messages, names, controls }: PerformerNamesPanelProps) {
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="names-heading">
      <h2 id="names-heading">{t("names.heading")}</h2>
      <ul class="rows" data-testid="panel-names-list">
        {names.map((name) => (
          <NameRow key={name.id} messages={messages} name={name} controls={controls} />
        ))}
      </ul>
      <NameForm messages={messages} controls={controls} />
    </section>
  );
}
