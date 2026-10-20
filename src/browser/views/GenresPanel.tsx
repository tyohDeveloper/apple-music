// The genres of an album, recording or performer, in order: the first is the main genre.
// Each change is saved at once.
import type { GenreAssignmentControls } from "../controllers/genreAssignmentOf.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { GenrePickerControls } from "../controllers/useGenrePicker.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { GenreChoice, GenreFinder } from "./GenreFinder.tsx";

type GenresPanelProps = {
  readonly messages: Messages;
  readonly genres: readonly { readonly id: string; readonly name: string }[];
  readonly saving: boolean;
  readonly controls: GenreAssignmentControls;
  readonly picker: GenrePickerControls;
  readonly onOpenGenre: (genreId: string) => void;
};

function GenreRow({ messages, genres, saving, controls, onOpenGenre, index }: Omit<GenresPanelProps, "picker"> & { readonly index: number }) {
  const { t } = messages;
  const genre = genres[index];
  if (genre === undefined) return null;
  return (
    <li class="row">
      <span class="row-main">
        <button type="button" class="link-button" data-testid={`button-assigned-open-${index}`} onClick={() => onOpenGenre(genre.id)}>{genre.name}</button>
        {index === 0 && <span class="badge">{t("assigned.main")}</span>}
      </span>
      <span class="row-actions">
        <button type="button" class="secondary" disabled={saving || index === 0} data-testid={`button-assigned-up-${index}`} onClick={() => controls.change({ kind: "moved", index, offset: -1 })}>{t("assigned.up")}</button>
        <button type="button" class="secondary" disabled={saving || index === genres.length - 1} data-testid={`button-assigned-down-${index}`} onClick={() => controls.change({ kind: "moved", index, offset: 1 })}>{t("assigned.down")}</button>
        <button type="button" class="secondary" disabled={saving} data-testid={`button-assigned-remove-${index}`} onClick={() => controls.change({ kind: "removed", index })}>{t("assigned.remove")}</button>
      </span>
    </li>
  );
}

export function GenresPanel(props: GenresPanelProps) {
  const { messages, genres, saving, controls, picker } = props;
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="assigned-heading">
      <h2 id="assigned-heading">{t("assigned.heading")}</h2>
      {genres.length === 0 && <p data-testid="display-assigned-empty">{t("assigned.empty")}</p>}
      <ol class="rows" data-testid="panel-assigned-list">
        {genres.map((genre, index) => <GenreRow key={genre.id} {...props} index={index} />)}
      </ol>
      <div class="stack inline-form">
        <h3>{t("assigned.add.heading")}</h3>
        <GenreFinder messages={messages} picker={picker} label={t("assigned.add.query")} />
        <form class="stack" data-testid="panel-assigned-add" onSubmit={(event) => controls.add(formValuesOf(event))}>
          <GenreChoice messages={messages} picker={picker} label={t("assigned.add.genre")} name="genreId" topLevel={false} />
          <button type="submit" class="secondary" disabled={saving || picker.state.results.length === 0} data-testid="button-assigned-add">{t("assigned.add.submit")}</button>
        </form>
      </div>
    </section>
  );
}
