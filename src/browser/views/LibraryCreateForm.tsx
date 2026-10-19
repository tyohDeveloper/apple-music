import type { Messages } from "../controllers/useMessages.ts";

type LibraryCreateFormProps = {
  readonly messages: Messages;
  readonly creating: boolean;
  readonly failure: string | null;
  readonly onCreate: (label: string) => void;
};

export function LibraryCreateForm({ messages, creating, failure, onCreate }: LibraryCreateFormProps) {
  const { t } = messages;
  const submit = (event: SubmitEvent): void => {
    event.preventDefault();
    const formElement = event.currentTarget as HTMLFormElement;
    onCreate(String(new FormData(formElement).get("label") ?? ""));
    formElement.reset();
  };
  return (
    <form class="stack inline-form" data-testid="panel-libraries-create" onSubmit={submit}>
      <h2>{t("libraries.create.heading")}</h2>
      <label class="field">
        <span>{t("libraries.create.label")}</span>
        <input name="label" required maxLength={200} data-testid="input-libraries-label" />
      </label>
      {failure !== null && (
        <p role="alert" class="error" data-testid="display-libraries-create-error">{messages.errorMessage(failure)}</p>
      )}
      <button type="submit" disabled={creating} data-testid="button-libraries-create">
        {t("libraries.create.submit")}
      </button>
    </form>
  );
}
