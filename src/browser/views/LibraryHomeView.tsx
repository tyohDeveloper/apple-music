import type { LibrarySummary } from "../../contracts/libraries/librarySummarySchema.ts";
import type { Messages } from "../controllers/useMessages.ts";

type LibraryHomeViewProps = {
  readonly messages: Messages;
  readonly library: LibrarySummary | null;
  readonly onBack: () => void;
};

export function LibraryHomeView({ messages, library, onBack }: LibraryHomeViewProps) {
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="library-heading">
      <button type="button" class="link-button" data-testid="button-library-back" onClick={onBack}>
        {t("library.back")}
      </button>
      <h1 id="library-heading" data-testid="text-library-label">{library?.label ?? t("library.heading")}</h1>
    </section>
  );
}
