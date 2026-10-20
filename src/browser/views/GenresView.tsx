// The genre list in tree order, searchable by name or alias, and the form for a new
// top-level genre; subgenres are added from their parent's page.
import { formValuesOf, type FormValues } from "../controllers/formValuesOf.ts";
import type { GenreListControls } from "../controllers/useGenreList.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { pageRangeOf } from "../state/catalog/catalogListReducer.ts";
import { CatalogPager } from "./CatalogPager.tsx";
import { GenreCard } from "./GenreCard.tsx";

type GenresViewProps = {
  readonly messages: Messages;
  readonly controls: GenreListControls;
  readonly onBack: () => void;
  readonly onOpen: (genreId: string) => void;
};

function GenreResults({ messages, controls, onOpen }: Omit<GenresViewProps, "onBack">) {
  const { t } = messages;
  const { state } = controls;
  const range = pageRangeOf(state);
  return (
    <>
      {state.status === "loading" && <p data-testid="display-genres-loading">{t("app.loading")}</p>}
      {state.failure !== null && <p role="alert" class="error" data-testid="display-genres-error">{messages.errorMessage(state.failure)}</p>}
      {state.status === "loaded" && range.total === 0 && <p data-testid="display-genres-empty">{t("genres.empty")}</p>}
      <ul class="card-list" data-testid="panel-genres-results">
        {state.items.map((genre) => (
          <li key={genre.id}>
            <GenreCard messages={messages} genre={genre} onOpen={onOpen} />
          </li>
        ))}
      </ul>
      <CatalogPager messages={messages} list="genres" range={range} onPrevious={controls.showPrevious} onNext={controls.showNext} />
    </>
  );
}

type GenreCreateFormProps = { readonly messages: Messages; readonly creating: boolean; readonly failure: string | null; readonly onCreate: (values: FormValues) => void };

function GenreCreateForm({ messages, creating, failure, onCreate }: GenreCreateFormProps) {
  const { t } = messages;
  return (
    <form class="panel stack" data-testid="panel-genres-create" onSubmit={(event) => onCreate(formValuesOf(event))}>
      <h2>{t("genres.create.heading")}</h2>
      <label class="field">
        <span>{t("genres.create.name")}</span>
        <input name="name" required maxLength={300} data-testid="input-genres-name" />
      </label>
      {failure !== null && <p role="alert" class="error" data-testid="display-genres-create-error">{messages.errorMessage(failure)}</p>}
      <button type="submit" disabled={creating} data-testid="button-genres-create">{t("genres.create.submit")}</button>
    </form>
  );
}

export function GenresView({ messages, controls, onBack, onOpen }: GenresViewProps) {
  const { t } = messages;
  return (
    <>
      <section class="panel" aria-labelledby="genres-heading">
        <button type="button" class="link-button" data-testid="button-genres-back" onClick={onBack}>{t("genres.back")}</button>
        <h1 id="genres-heading">{t("genres.heading")}</h1>
        <form class="search-form" data-testid="panel-genres-search" onSubmit={(event) => controls.search(formValuesOf(event))}>
          <label class="field">
            <span>{t("genres.search.label")}</span>
            <input name="query" type="search" maxLength={200} defaultValue={controls.state.query} data-testid="input-genres-query" />
          </label>
          <button type="submit" data-testid="button-genres-search">{t("genres.search.submit")}</button>
        </form>
        <GenreResults messages={messages} controls={controls} onOpen={onOpen} />
      </section>
      <GenreCreateForm messages={messages} creating={controls.state.creating} failure={controls.state.createFailure} onCreate={controls.create} />
    </>
  );
}
