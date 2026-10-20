// Finds genres to choose from: a search, then a choice among the first page of results,
// each shown under its path so that two genres of one name can be told apart.
import type { GenreSummary } from "../../contracts/genres/genreSummarySchema.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { GenrePickerControls } from "../controllers/useGenrePicker.ts";
import type { Messages } from "../controllers/useMessages.ts";

type GenreFinderProps = { readonly messages: Messages; readonly picker: GenrePickerControls; readonly label: string };

export function GenreFinder({ messages, picker, label }: GenreFinderProps) {
  const { t } = messages;
  return (
    <>
      <form class="search-form" data-testid="panel-genrepick-find" onSubmit={(event) => picker.search(formValuesOf(event))}>
        <label class="field">
          <span>{label}</span>
          <input name="query" type="search" maxLength={200} data-testid="input-genrepick-query" />
        </label>
        <button type="submit" class="secondary" data-testid="button-genrepick-find">{t("genrepick.find")}</button>
      </form>
      {picker.state.status === "loaded" && picker.state.results.length === 0 && <p data-testid="display-genrepick-noresults">{t("genrepick.noResults")}</p>}
    </>
  );
}

function genreLabelOf(messages: Messages, genre: Pick<GenreSummary, "name" | "path">): string {
  return [...genre.path, genre.name].join(messages.t("genres.pathSeparator"));
}

type GenreChoiceProps = GenreFinderProps & { readonly name: string; readonly topLevel: boolean; readonly excludeId?: string };

// Each search chooses its first result; a placement can choose the top level instead, and
// never offers the genre being placed.
export function GenreChoice({ messages, picker, label, name, topLevel, excludeId }: GenreChoiceProps) {
  const { t } = messages;
  const choices = picker.state.results.filter((result) => result.id !== excludeId);
  return (
    <label class="field">
      <span>{label}</span>
      <select name={name} required={!topLevel} data-testid="select-genrepick-genre">
        {topLevel && <option value="">{t("genrepick.topLevel")}</option>}
        {choices.map((result, index) => (
          <option key={result.id} value={result.id} selected={index === 0}>{genreLabelOf(messages, result)}</option>
        ))}
      </select>
    </label>
  );
}
