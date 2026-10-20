// A genre's place in the tree: where it sits, and the move under another genre or to the
// top level; then its subgenres, with the form for a new one.
import type { GenreDetail } from "../../contracts/genres/genreDetailSchema.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { GenreEditorControls } from "../controllers/useGenreEditor.ts";
import type { GenrePickerControls } from "../controllers/useGenrePicker.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { GenreChoice, GenreFinder } from "./GenreFinder.tsx";

type TreePanelProps = {
  readonly messages: Messages;
  readonly genre: GenreDetail;
  readonly controls: GenreEditorControls;
  readonly onOpenGenre: (genreId: string) => void;
};

export function GenrePlacementPanel({ messages, genre, controls, picker }: TreePanelProps & { readonly picker: GenrePickerControls }) {
  const { t } = messages;
  const parent = genre.path.at(-1);
  return (
    <section class="panel stack" aria-labelledby="placement-heading">
      <h2 id="placement-heading">{t("genre.placement.heading")}</h2>
      <p data-testid="display-genre-parent">{parent === undefined ? t("genre.placement.topLevel") : t("genre.placement.under", { name: parent.name })}</p>
      <GenreFinder messages={messages} picker={picker} label={t("genre.placement.query")} />
      <form class="stack" data-testid="panel-genre-move" onSubmit={(event) => controls.move(formValuesOf(event))}>
        <GenreChoice messages={messages} picker={picker} label={t("genre.placement.parent")} name="parentId" topLevel excludeId={genre.id} />
        <button type="submit" class="secondary" disabled={controls.state.saving} data-testid="button-genre-move">{t("genre.placement.submit")}</button>
      </form>
    </section>
  );
}

export function SubgenresPanel({ messages, genre, controls, onOpenGenre }: TreePanelProps) {
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="subgenres-heading">
      <h2 id="subgenres-heading">{t("subgenres.heading")}</h2>
      {genre.subgenres.length === 0 && <p data-testid="display-subgenres-empty">{t("subgenres.empty")}</p>}
      <ul class="rows" data-testid="panel-subgenres-list">
        {genre.subgenres.map((subgenre) => (
          <li key={subgenre.id} class="row">
            <button type="button" class="link-button" data-testid={`button-subgenres-open-${subgenre.id}`} onClick={() => onOpenGenre(subgenre.id)}>{subgenre.name}</button>
          </li>
        ))}
      </ul>
      <form class="stack inline-form" data-testid="panel-subgenres-add" onSubmit={(event) => controls.addSubgenre(formValuesOf(event, true))}>
        <label class="field">
          <span>{t("subgenres.add.name")}</span>
          <input name="name" required maxLength={300} data-testid="input-subgenres-name" />
        </label>
        <button type="submit" class="secondary" disabled={controls.state.saving} data-testid="button-subgenres-add">{t("subgenres.add.submit")}</button>
      </form>
    </section>
  );
}
