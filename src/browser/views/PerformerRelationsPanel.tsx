import performerRelationKinds from "../../../data/taxonomies/performer-relation-kinds.json" with { type: "json" };
import type { PerformerRelation } from "../../contracts/performers/performerRelationSchema.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { PerformerEditorControls } from "../controllers/usePerformerEditor.ts";
import type { PerformerPickerControls } from "../controllers/usePerformerPicker.ts";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type PerformerRelationsPanelProps = {
  readonly messages: Messages;
  readonly relations: readonly PerformerRelation[];
  readonly controls: PerformerEditorControls;
  readonly picker: PerformerPickerControls;
  readonly onOpenPerformer: (performerId: string) => void;
};

type RelationRowProps = Pick<PerformerRelationsPanelProps, "messages" | "controls" | "onOpenPerformer"> & { readonly relation: PerformerRelation };

function RelationRow({ messages, relation, controls, onOpenPerformer }: RelationRowProps) {
  const { t } = messages;
  return (
    <li class="row">
      <span class="row-main">
        <button type="button" class="link-button" data-testid={`button-relations-subject-${relation.id}`} onClick={() => onOpenPerformer(relation.subject.id)}>
          {relation.subject.name}
        </button>
        <span class="muted">{messages.displayName("performerRelationKind", relation.kind)}</span>
        <button type="button" class="link-button" data-testid={`button-relations-object-${relation.id}`} onClick={() => onOpenPerformer(relation.object.id)}>
          {relation.object.name}
        </button>
        {relation.roles.length > 0 && <span class="muted">{t("relations.roles", { roles: messages.list(relation.roles) })}</span>}
      </span>
      <button type="button" class="secondary" disabled={controls.state.saving} data-testid={`button-relations-remove-${relation.id}`} onClick={() => controls.removeRelation(relation.id)}>
        {t("relations.remove")}
      </button>
    </li>
  );
}

function RelationForm({ messages, controls, picker }: Pick<PerformerRelationsPanelProps, "messages" | "controls" | "picker">) {
  const { t } = messages;
  return (
    <div class="stack inline-form">
      <h3>{t("relations.add.heading")}</h3>
      <form class="search-form" data-testid="panel-relations-find" onSubmit={(event) => picker.search(formValuesOf(event))}>
        <label class="field">
          <span>{t("relations.add.query")}</span>
          <input name="query" type="search" maxLength={200} data-testid="input-relations-query" />
        </label>
        <button type="submit" class="secondary" data-testid="button-relations-find">{t("relations.add.find")}</button>
      </form>
      {picker.state.status === "loaded" && picker.state.results.length === 0 && <p data-testid="display-relations-noresults">{t("relations.add.noResults")}</p>}
      <form class="stack" data-testid="panel-relations-add" onSubmit={(event) => controls.addRelation(formValuesOf(event, true))}>
        <div class="field-row">
          <label class="field">
            <span>{t("relations.add.kind")}</span>
            <select name="kind" data-testid="select-relations-kind">
              <TaxonomyOptions messages={messages} taxonomy={performerRelationKinds} />
            </select>
          </label>
          <label class="field">
            <span>{t("relations.add.object")}</span>
            <select name="objectId" required data-testid="select-relations-object">
              {picker.state.results.map((result) => (
                <option key={result.id} value={result.id}>{result.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label class="field">
          <span>{t("relations.add.roles")}</span>
          <input name="roles" maxLength={1000} data-testid="input-relations-roles" />
        </label>
        <button type="submit" disabled={controls.state.saving || picker.state.results.length === 0} data-testid="button-relations-add">
          {t("relations.add.submit")}
        </button>
      </form>
    </div>
  );
}

export function PerformerRelationsPanel({ messages, relations, controls, picker, onOpenPerformer }: PerformerRelationsPanelProps) {
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="relations-heading">
      <h2 id="relations-heading">{t("relations.heading")}</h2>
      {relations.length === 0 && <p data-testid="display-relations-empty">{t("relations.empty")}</p>}
      <ul class="rows" data-testid="panel-relations-list">
        {relations.map((relation) => (
          <RelationRow key={relation.id} messages={messages} relation={relation} controls={controls} onOpenPerformer={onOpenPerformer} />
        ))}
      </ul>
      <RelationForm messages={messages} controls={controls} picker={picker} />
    </section>
  );
}
