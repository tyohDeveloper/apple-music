import type { LibrarySummary } from "../../contracts/libraries/librarySummarySchema.ts";
import type { Messages } from "../controllers/useMessages.ts";

type LibraryHomeViewProps = {
  readonly messages: Messages;
  readonly library: LibrarySummary | null;
  readonly exportHref: string;
  readonly onBack: () => void;
  readonly onOpen: (section: LibrarySection) => void;
};

export type LibrarySection = "albums" | "performers" | "recordings" | "genres" | "apple-music";

// The library's JSON export, downloaded by the browser under the name the server gives it.
function LibraryExportSection({ messages, href }: { readonly messages: Messages; readonly href: string }) {
  const { t } = messages;
  return (
    <div class="panel-section">
      <h2>{t("library.export")}</h2>
      <p>{t("library.export.summary")}</p>
      <a href={href} download data-testid="button-library-export">
        {t("library.export.download")}
      </a>
    </div>
  );
}

export function LibraryHomeView({ messages, library, exportHref, onBack, onOpen }: LibraryHomeViewProps) {
  const { t } = messages;
  return (
    <section class="panel" aria-labelledby="library-heading">
      <button type="button" class="link-button" data-testid="button-library-back" onClick={onBack}>
        {t("library.back")}
      </button>
      <h1 id="library-heading" data-testid="text-library-label">{library?.label ?? t("library.heading")}</h1>
      <h2>{t("library.sections")}</h2>
      <ul class="card-list">
        <li>
          <button type="button" class="card" data-testid="button-library-albums" onClick={() => onOpen("albums")}>
            <span class="card-title">{t("library.albums")}</span>
            <span class="card-meta">{t("library.albums.summary")}</span>
          </button>
        </li>
        <li>
          <button type="button" class="card" data-testid="button-library-recordings" onClick={() => onOpen("recordings")}>
            <span class="card-title">{t("library.recordings")}</span>
            <span class="card-meta">{t("library.recordings.summary")}</span>
          </button>
        </li>
        <li>
          <button type="button" class="card" data-testid="button-library-performers" onClick={() => onOpen("performers")}>
            <span class="card-title">{t("library.performers")}</span>
            <span class="card-meta">{t("library.performers.summary")}</span>
          </button>
        </li>
        <li>
          <button type="button" class="card" data-testid="button-library-genres" onClick={() => onOpen("genres")}>
            <span class="card-title">{t("library.genres")}</span>
            <span class="card-meta">{t("library.genres.summary")}</span>
          </button>
        </li>
        <li>
          <button type="button" class="card" data-testid="button-library-applemusic" onClick={() => onOpen("apple-music")}>
            <span class="card-title">{t("library.apple-music")}</span>
            <span class="card-meta">{t("library.apple-music.summary")}</span>
          </button>
        </li>
      </ul>
      {library === null ? null : <LibraryExportSection messages={messages} href={exportHref} />}
    </section>
  );
}
