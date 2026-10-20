// One genre in the genre list: its name under its path, and how many subgenres and uses
// it has.
import type { GenreSummary } from "../../contracts/genres/genreSummarySchema.ts";
import type { Messages } from "../controllers/useMessages.ts";

type GenreCardProps = { readonly messages: Messages; readonly genre: GenreSummary; readonly onOpen: (genreId: string) => void };

export function GenreCard({ messages, genre, onOpen }: GenreCardProps) {
  const { t } = messages;
  const facts = [
    t("genres.subgenreCount", { count: messages.number(genre.subgenreCount) }),
    t("genres.useCount", { count: messages.number(genre.useCount) }),
  ];
  return (
    <button type="button" class="card" data-testid={`button-genres-open-${genre.id}`} onClick={() => onOpen(genre.id)}>
      <span class="card-title">{genre.name}</span>
      {genre.path.length > 0 && <span class="card-meta">{t("genres.under", { path: genre.path.join(t("genres.pathSeparator")) })}</span>}
      <span class="card-meta">{facts.join(" · ")}</span>
    </button>
  );
}
