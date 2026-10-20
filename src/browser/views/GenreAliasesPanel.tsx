// A genre's aliases: other names that resolve to it, such as an Apple Music genre name. An
// alias names one genre in a library.
import type { GenreDetail } from "../../contracts/genres/genreDetailSchema.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { GenreEditorControls } from "../controllers/useGenreEditor.ts";
import type { Messages } from "../controllers/useMessages.ts";

type GenreAliasesPanelProps = { readonly messages: Messages; readonly genre: GenreDetail; readonly controls: GenreEditorControls };

export function GenreAliasesPanel({ messages, genre, controls }: GenreAliasesPanelProps) {
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="aliases-heading">
      <h2 id="aliases-heading">{t("aliases.heading")}</h2>
      <p class="hint">{t("aliases.hint")}</p>
      {genre.aliases.length === 0 && <p data-testid="display-aliases-empty">{t("aliases.empty")}</p>}
      <ul class="rows" data-testid="panel-aliases-list">
        {genre.aliases.map((alias) => (
          <li key={alias.id} class="row">
            <span class="row-main">{alias.name}</span>
            <span class="row-actions">
              <button type="button" class="secondary" disabled={controls.state.saving} data-testid={`button-aliases-remove-${alias.id}`} onClick={() => controls.removeAlias(alias.id)}>{t("aliases.remove")}</button>
            </span>
          </li>
        ))}
      </ul>
      <form class="stack inline-form" data-testid="panel-aliases-add" onSubmit={(event) => controls.addAlias(formValuesOf(event, true))}>
        <label class="field">
          <span>{t("aliases.add.name")}</span>
          <input name="name" required maxLength={300} data-testid="input-aliases-name" />
        </label>
        <button type="submit" class="secondary" disabled={controls.state.saving} data-testid="button-aliases-add">{t("aliases.add.submit")}</button>
      </form>
    </section>
  );
}
