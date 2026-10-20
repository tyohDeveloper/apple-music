// The editions of an album: each opens its own editor; a new edition starts from a title and
// a kind, and its tracks are entered in the edition editor.
import editionKinds from "../../../data/taxonomies/edition-kinds.json" with { type: "json" };
import type { AlbumDetail } from "../../contracts/albums/albumDetailSchema.ts";
import type { AlbumEditorControls } from "../controllers/useAlbumEditor.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";

type EditionsPanelProps = {
  readonly messages: Messages;
  readonly album: AlbumDetail;
  readonly controls: AlbumEditorControls;
  readonly onOpenEdition: (editionId: string) => void;
};

function EditionCreateForm({ messages, album, controls }: Omit<EditionsPanelProps, "onOpenEdition">) {
  const { t } = messages;
  return (
    <form class="stack inline-form" data-testid="panel-editions-create" onSubmit={(event) => controls.createEdition(formValuesOf(event))}>
      <h3>{t("editions.create.heading")}</h3>
      <div class="field-row">
        <label class="field">
          <span>{t("editions.create.title")}</span>
          <input name="title" required maxLength={300} defaultValue={album.title} data-testid="input-editions-title" />
        </label>
        <label class="field">
          <span>{t("editions.create.kind")}</span>
          <select name="kind" required data-testid="select-editions-kind">
            <TaxonomyOptions messages={messages} taxonomy={editionKinds} />
          </select>
        </label>
      </div>
      <button type="submit" class="secondary" disabled={controls.state.saving} data-testid="button-editions-create">{t("editions.create.submit")}</button>
    </form>
  );
}

export function EditionsPanel({ messages, album, controls, onOpenEdition }: EditionsPanelProps) {
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="editions-heading">
      <h2 id="editions-heading">{t("editions.heading")}</h2>
      {album.editions.length === 0 && <p data-testid="display-editions-empty">{t("editions.empty")}</p>}
      <ul class="card-list" data-testid="panel-editions-list">
        {album.editions.map((edition) => (
          <li key={edition.id}>
            <button type="button" class="card" data-testid={`button-editions-open-${edition.id}`} onClick={() => onOpenEdition(edition.id)}>
              <span class="card-title">{edition.title}</span>
              <span class="card-meta">
                {[messages.displayName("editionKind", edition.kind), ...(edition.released === null ? [] : [edition.released]), t("albums.trackCount", { count: messages.number(edition.trackCount) })].join(" · ")}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <EditionCreateForm messages={messages} album={album} controls={controls} />
    </section>
  );
}
