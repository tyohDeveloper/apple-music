// A genre's name and notes, and its deletion; a genre with subgenres or uses is refused.
import type { GenreDetail } from "../../contracts/genres/genreDetailSchema.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { GenreEditorControls } from "../controllers/useGenreEditor.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { DeleteConfirmation } from "./DeleteConfirmation.tsx";

type GenreDetailsFormProps = { readonly messages: Messages; readonly genre: GenreDetail; readonly controls: GenreEditorControls };

export function GenreDetailsForm({ messages, genre, controls }: GenreDetailsFormProps) {
  const { t } = messages;
  return (
    <form key={genre.id} class="panel stack" data-testid="panel-genre-details" onSubmit={(event) => controls.save(formValuesOf(event))}>
      <h2>{t("genre.details")}</h2>
      <label class="field">
        <span>{t("genre.name")}</span>
        <input name="name" required maxLength={300} defaultValue={genre.name} data-testid="input-genre-name" />
      </label>
      <label class="field">
        <span>{t("genre.notes")}</span>
        <textarea name="notes" rows={3} maxLength={10000} defaultValue={genre.notes ?? ""} data-testid="input-genre-notes" />
      </label>
      <div class="actions">
        <button type="submit" disabled={controls.state.saving} data-testid="button-genre-save">{t("genre.save")}</button>
        <DeleteConfirmation labels={{ request: t("genre.delete"), confirm: t("genre.delete.confirm"), cancel: t("genre.delete.cancel") }} controls={controls} />
      </div>
    </form>
  );
}
