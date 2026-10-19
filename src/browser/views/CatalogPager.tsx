// Previous and next page buttons and the "1–25 of 340" range under a catalog list.
import type { Messages } from "../controllers/useMessages.ts";
import type { PageRange } from "../state/catalog/catalogListReducer.ts";

type CatalogPagerProps = {
  readonly messages: Messages;
  readonly range: PageRange;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
};

export function CatalogPager({ messages, range, onPrevious, onNext }: CatalogPagerProps) {
  const { t } = messages;
  if (range.total === 0) return null;
  return (
    <div class="pager">
      <button type="button" class="secondary" disabled={!range.hasPrevious} data-testid="button-pager-previous" onClick={onPrevious}>
        {t("pager.previous")}
      </button>
      <span data-testid="display-pager-range">
        {t("pager.range", { from: messages.number(range.from), to: messages.number(range.to), total: messages.number(range.total) })}
      </span>
      <button type="button" class="secondary" disabled={!range.hasNext} data-testid="button-pager-next" onClick={onNext}>
        {t("pager.next")}
      </button>
    </div>
  );
}
