import type { SessionUser } from "../../contracts/session/sessionUser.ts";
import type { Route } from "../../routing/parseRoute.ts";
import type { Messages } from "../controllers/useMessages.ts";

type AppHeaderProps = {
  readonly messages: Messages;
  readonly user: SessionUser | null;
  readonly onNavigate: (route: Route) => void;
  readonly onSignOut: () => void;
};

export function AppHeader({ messages, user, onNavigate, onSignOut }: AppHeaderProps) {
  const { t } = messages;
  return (
    <header class="app-header">
      <p class="app-title" data-testid="text-header-title">{t("app.title")}</p>
      {user !== null && (
        <nav class="app-nav" aria-label={t("nav.libraries")}>
          <button type="button" class="link-button" data-testid="tab-nav-libraries" onClick={() => onNavigate({ name: "libraries" })}>
            {t("nav.libraries")}
          </button>
          <span class="app-user" data-testid="display-header-user">{t("header.signedInAs", { name: user.name })}</span>
          <button type="button" class="secondary" data-testid="button-header-signout" onClick={onSignOut}>
            {t("header.signOut")}
          </button>
        </nav>
      )}
    </header>
  );
}
