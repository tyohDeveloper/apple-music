import type { Messages } from "../controllers/useMessages.ts";

type NotFoundViewProps = { readonly messages: Messages; readonly onBack: () => void };

export function NotFoundView({ messages, onBack }: NotFoundViewProps) {
  return (
    <section class="panel narrow" aria-labelledby="not-found-heading">
      <h1 id="not-found-heading">{messages.t("notFound.heading")}</h1>
      <button type="button" data-testid="button-notfound-back" onClick={onBack}>
        {messages.t("notFound.back")}
      </button>
    </section>
  );
}
