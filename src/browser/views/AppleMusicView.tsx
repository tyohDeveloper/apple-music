// A library's Apple Music connection. Connecting opens Apple's own sign-in window; only the
// library's owner connects or disconnects, other members see the state.
import type { AppleMusicConnection } from "../../contracts/apple-music/appleMusicConnectionSchema.ts";
import type { LibrarySummary } from "../../contracts/libraries/librarySummarySchema.ts";
import type { AppleMusicConnectionControls } from "../controllers/useAppleMusicConnection.ts";
import type { Messages } from "../controllers/useMessages.ts";

type AppleMusicViewProps = {
  readonly messages: Messages;
  readonly library: LibrarySummary | null;
  readonly controls: AppleMusicConnectionControls;
  readonly onBack: () => void;
};

type StatusProps = { readonly messages: Messages; readonly owner: boolean; readonly controls: AppleMusicConnectionControls };
type ConnectedProps = StatusProps & { readonly connection: Extract<AppleMusicConnection, { readonly status: "connected" }> };

function ConnectedStatus({ messages, owner, controls, connection }: ConnectedProps) {
  const { t } = messages;
  const { storefront } = connection;
  return (
    <>
      <p data-testid="display-applemusic-connected">{t("applemusic.connected", { date: messages.instant(connection.connectedAt) })}</p>
      {storefront === null ? null : <p data-testid="display-applemusic-storefront">{t("applemusic.storefront", { storefront: storefront.toUpperCase() })}</p>}
      {owner ? (
        <button type="button" class="secondary" data-testid="button-applemusic-disconnect" disabled={controls.state.changing} onClick={controls.disconnect}>
          {t("applemusic.disconnect")}
        </button>
      ) : null}
    </>
  );
}

function DisconnectedStatus({ messages, owner, controls }: StatusProps) {
  const { t } = messages;
  return (
    <>
      <p data-testid="display-applemusic-notconnected">{t("applemusic.not-connected")}</p>
      {owner ? <p class="card-meta">{t("applemusic.connect.hint")}</p> : null}
      {owner ? (
        <button type="button" data-testid="button-applemusic-connect" disabled={controls.state.changing} onClick={controls.connect}>
          {t("applemusic.connect")}
        </button>
      ) : null}
    </>
  );
}

function ConnectionStatus({ messages, owner, controls }: StatusProps) {
  const { t } = messages;
  const { state } = controls;
  if (state.status === "loading") return <p data-testid="display-applemusic-loading">{t("app.loading")}</p>;
  if (state.status === "failed") return null;
  if (!state.configured) return <p data-testid="display-applemusic-unconfigured">{t("applemusic.unconfigured")}</p>;
  const { connection } = state;
  const status = connection?.status === "connected" ? <ConnectedStatus messages={messages} owner={owner} controls={controls} connection={connection} /> : <DisconnectedStatus messages={messages} owner={owner} controls={controls} />;
  return (
    <>
      {status}
      {owner ? null : <p class="card-meta" data-testid="display-applemusic-owneronly">{t("applemusic.owner-only")}</p>}
    </>
  );
}

export function AppleMusicView({ messages, library, controls, onBack }: AppleMusicViewProps) {
  const { t } = messages;
  return (
    <section class="panel" data-testid="panel-applemusic">
      <button type="button" class="link-button" data-testid="button-applemusic-back" onClick={onBack}>
        {t("applemusic.back")}
      </button>
      <h1 data-testid="text-applemusic-heading">{t("applemusic.heading")}</h1>
      <p>{t("applemusic.summary")}</p>
      {controls.state.failure === null ? null : (
        <p role="alert" class="error" data-testid="display-applemusic-error">{messages.errorMessage(controls.state.failure)}</p>
      )}
      <ConnectionStatus messages={messages} owner={library?.role === "owner"} controls={controls} />
    </section>
  );
}
