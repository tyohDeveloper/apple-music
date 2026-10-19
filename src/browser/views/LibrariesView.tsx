import type { Messages } from "../controllers/useMessages.ts";
import type { LibraryListState } from "../state/libraries/libraryListReducer.ts";
import { LibraryCreateForm } from "./LibraryCreateForm.tsx";

type LibrariesViewProps = {
  readonly messages: Messages;
  readonly state: LibraryListState;
  readonly onCreate: (label: string) => void;
  readonly onOpen: (libraryId: string) => void;
};

export function LibrariesView({ messages, state, onCreate, onOpen }: LibrariesViewProps) {
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="libraries-heading">
      <h1 id="libraries-heading">{t("libraries.heading")}</h1>
      {state.status === "loading" && <p data-testid="display-libraries-loading">{t("app.loading")}</p>}
      {state.failure !== null && (
        <p role="alert" class="error" data-testid="display-libraries-error">{messages.errorMessage(state.failure)}</p>
      )}
      {state.status === "loaded" && state.libraries.length === 0 && (
        <p data-testid="display-libraries-empty">{t("libraries.empty")}</p>
      )}
      <ul class="card-list" data-testid="panel-libraries-list">
        {state.libraries.map((library) => (
          <li key={library.id}>
            <button type="button" class="card" data-testid={`button-libraries-open-${library.id}`} onClick={() => onOpen(library.id)}>
              <span class="card-title">{library.label}</span>
              <span class="card-meta">{t("libraries.role", { role: messages.displayName("libraryRole", library.role) })}</span>
            </button>
          </li>
        ))}
      </ul>
      <LibraryCreateForm messages={messages} creating={state.creating} failure={state.createFailure} onCreate={onCreate} />
    </section>
  );
}
