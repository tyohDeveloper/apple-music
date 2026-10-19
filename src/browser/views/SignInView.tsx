import type { Messages } from "../controllers/useMessages.ts";
import type { SessionState } from "../state/session/sessionReducer.ts";

type SignInViewProps = {
  readonly messages: Messages;
  readonly state: SessionState;
  readonly onSignIn: (email: string, password: string) => void;
};

export function SignInView({ messages, state, onSignIn }: SignInViewProps) {
  const { t } = messages;
  const submit = (event: SubmitEvent): void => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    onSignIn(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  };
  return (
    <section class="panel narrow" aria-labelledby="sign-in-heading">
      <h1 id="sign-in-heading">{t("signIn.heading")}</h1>
      <form class="stack" data-testid="panel-signin-form" onSubmit={submit}>
        <label class="field">
          <span>{t("signIn.email")}</span>
          <input name="email" type="email" autocomplete="username" required data-testid="input-signin-email" />
        </label>
        <label class="field">
          <span>{t("signIn.password")}</span>
          <input name="password" type="password" autocomplete="current-password" required data-testid="input-signin-password" />
        </label>
        {state.failure !== null && (
          <p role="alert" class="error" data-testid="display-signin-error">{messages.errorMessage(state.failure)}</p>
        )}
        <button type="submit" disabled={state.status === "signing-in"} data-testid="button-signin-submit">
          {t("signIn.submit")}
        </button>
      </form>
    </section>
  );
}
