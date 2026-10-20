// A track list as being edited, disc by disc: each track can move up or down within its disc
// or be removed, and the list is saved, or discarded, whole. The fields of a track and the
// form that adds one are the caller's.
import type { ComponentChildren } from "preact";
import type { Messages } from "../controllers/useMessages.ts";
import type { TrackListDraftControls } from "../controllers/useTrackListDraft.ts";

type TrackListPanelProps<T> = {
  readonly messages: Messages;
  readonly heading: string;
  readonly tracks: TrackListDraftControls<T>;
  readonly saving: boolean;
  readonly onSave: () => void;
  readonly onDiscard: () => void;
  readonly fieldsOf: (track: T, discIndex: number, position: number) => ComponentChildren;
  readonly children: ComponentChildren;
};

type TrackDiscProps<T> = Pick<TrackListPanelProps<T>, "messages" | "tracks" | "fieldsOf"> & { readonly disc: readonly T[]; readonly discIndex: number };

function TrackDisc<T>({ messages, tracks, fieldsOf, disc, discIndex }: TrackDiscProps<T>) {
  const { t } = messages;
  return (
    <div data-testid={`panel-tracks-disc-${discIndex}`}>
      <h3>{t("tracks.disc", { number: messages.number(discIndex + 1) })}</h3>
      <ol class="rows">
        {disc.map((track, position) => (
          <li key={position} class="credit-row" data-testid={`panel-track-${discIndex}-${position}`}>
            <div class="credit-head">
              <span class="muted">{messages.number(position + 1)}</span>
              <span class="row-actions">
                <button type="button" class="secondary" disabled={position === 0} data-testid={`button-track-up-${discIndex}-${position}`} onClick={() => tracks.move(discIndex, position, -1)}>{t("tracks.moveUp")}</button>
                <button type="button" class="secondary" disabled={position === disc.length - 1} data-testid={`button-track-down-${discIndex}-${position}`} onClick={() => tracks.move(discIndex, position, 1)}>{t("tracks.moveDown")}</button>
                <button type="button" class="secondary" data-testid={`button-track-remove-${discIndex}-${position}`} onClick={() => tracks.remove(discIndex, position)}>{t("tracks.remove")}</button>
              </span>
            </div>
            {fieldsOf(track, discIndex, position)}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TrackListPanel<T>({ messages, heading, tracks, saving, onSave, onDiscard, fieldsOf, children }: TrackListPanelProps<T>) {
  const { t } = messages;
  const { discs, dirty } = tracks.state;
  return (
    <section class="panel" aria-labelledby="tracks-heading">
      <h2 id="tracks-heading">{heading}</h2>
      {discs.length === 0 && <p data-testid="display-tracks-empty">{t("tracks.empty")}</p>}
      {discs.map((disc, discIndex) => (
        <TrackDisc key={discIndex} messages={messages} tracks={tracks} fieldsOf={fieldsOf} disc={disc} discIndex={discIndex} />
      ))}
      {dirty && (
        <div class="actions">
          <span class="muted" data-testid="display-tracks-unsaved">{t("tracks.unsaved")}</span>
          <button type="button" disabled={saving} data-testid="button-tracks-save" onClick={onSave}>{t("tracks.save")}</button>
          <button type="button" class="secondary" disabled={saving} data-testid="button-tracks-discard" onClick={onDiscard}>{t("tracks.discard")}</button>
        </div>
      )}
      {children}
    </section>
  );
}
