// Reading the library from Apple Music into the mirror (docs/design/apple-music-import.md,
// slice H): the latest read's status and counts, reading again or cancelling a read for
// owners and editors, and, for the owner after a read stopped for confirmation, replacing
// the mirror.
import type { SyncRun } from "../../contracts/apple-music/syncRunSchema.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { SyncRunControls } from "../controllers/useSyncRun.ts";

type SyncRunPanelProps = { readonly messages: Messages; readonly role: string | null; readonly controls: SyncRunControls };
type RunProps = { readonly messages: Messages; readonly run: SyncRun };

function phaseText({ t }: Messages, phase: SyncRun["phase"]): string {
  const texts: Readonly<Record<SyncRun["phase"], () => string>> = {
    songs: () => t("sync.phase.songs"),
    albums: () => t("sync.phase.albums"),
    artists: () => t("sync.phase.artists"),
    playlists: () => t("sync.phase.playlists"),
    "catalog-songs": () => t("sync.phase.catalog-songs"),
    "catalog-albums": () => t("sync.phase.catalog-albums"),
    removals: () => t("sync.phase.removals"),
  };
  return texts[phase]();
}

function statusText(messages: Messages, run: SyncRun): string {
  const { t } = messages;
  const date = messages.instant(run.finishedAt ?? run.startedAt);
  const texts: Readonly<Record<SyncRun["status"], () => string>> = {
    running: () => phaseText(messages, run.phase),
    succeeded: () => t("sync.succeeded", { date }),
    failed: () => t("sync.failed", { date, error: messages.errorMessage(run.errorCode ?? "unexpected") }),
    interrupted: () => t("sync.interrupted", { date }),
    cancelled: () => t("sync.cancelled", { date }),
    "needs-confirmation": () => t("sync.needs-confirmation", { date }),
  };
  return texts[run.status]();
}

type CountRow = readonly [key: string, label: string, value: number];

function CountList({ messages, rows }: { readonly messages: Messages; readonly rows: readonly CountRow[] }) {
  return (
    <dl class="counts">
      {rows.map(([key, label, value]) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd data-testid={`display-sync-count-${key}`}>{messages.number(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

// What the read found, then what it changed in the mirror.
function RunCounts({ messages, run }: RunProps) {
  const { t } = messages;
  const { counts } = run;
  const found: readonly CountRow[] = [
    ["songs", t("sync.count.songs"), counts.songs],
    ["albums", t("sync.count.albums"), counts.albums],
    ["artists", t("sync.count.artists"), counts.artists],
    ["playlists", t("sync.count.playlists"), counts.playlists],
    ["catalogsongs", t("sync.count.catalog-songs"), counts.catalogSongs],
    ["catalogalbums", t("sync.count.catalog-albums"), counts.catalogAlbums],
  ];
  const changes: readonly CountRow[] = [["added", t("sync.count.added"), counts.added], ["changed", t("sync.count.changed"), counts.changed], ["removed", t("sync.count.removed"), counts.removed]];
  return (
    <>
      <CountList messages={messages} rows={found} />
      <CountList messages={messages} rows={changes} />
    </>
  );
}

function SyncActions({ messages, role, controls }: SyncRunPanelProps) {
  const { t } = messages;
  const { state } = controls;
  if (state.run?.status === "running") {
    return <button type="button" class="secondary" data-testid="button-sync-cancel" disabled={state.changing} onClick={controls.cancel}>{t("sync.cancel")}</button>;
  }
  const replaceable = role === "owner" && state.run?.status === "needs-confirmation";
  return (
    <>
      {replaceable ? <p class="muted" data-testid="text-sync-replacehint">{t("sync.replace-hint")}</p> : null}
      <div class="actions">
        <button type="button" data-testid="button-sync-start" disabled={state.changing} onClick={() => controls.start(false)}>{t("sync.start")}</button>
        {replaceable ? <button type="button" class="secondary" data-testid="button-sync-replace" disabled={state.changing} onClick={() => controls.start(true)}>{t("sync.replace")}</button> : null}
      </div>
    </>
  );
}

export function SyncRunPanel({ messages, role, controls }: SyncRunPanelProps) {
  const { t } = messages;
  const { state } = controls;
  return (
    <section class="panel" data-testid="panel-sync" aria-labelledby="sync-heading">
      <h2 id="sync-heading" data-testid="text-sync-heading">{t("sync.heading")}</h2>
      <p>{t("sync.summary")}</p>
      {state.status === "loading" ? <p data-testid="display-sync-loading">{t("app.loading")}</p> : null}
      {state.failure === null ? null : <p role="alert" class="error" data-testid="display-sync-error">{messages.errorMessage(state.failure)}</p>}
      {state.status === "ready" ? <p data-testid="display-sync-status" aria-live="polite">{state.run === null ? t("sync.never") : statusText(messages, state.run)}</p> : null}
      {state.run === null ? null : <RunCounts messages={messages} run={state.run} />}
      {role === "owner" || role === "editor" ? <SyncActions messages={messages} role={role} controls={controls} /> : null}
    </section>
  );
}
