// The tracks of an edition as being edited: each has its title as issued, how it relates to
// the intended album, and its recording when known. A track is added by title, from a
// recording, or both.
import trackInclusions from "../../../data/taxonomies/track-inclusions.json" with { type: "json" };
import type { EditionTrack } from "../../contracts/editions/editionTrackSchema.ts";
import type { EditionEditorControls } from "../controllers/useEditionEditor.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { RecordingPickerControls } from "../controllers/useRecordingPicker.ts";
import { DiscChoice, RecordingChoice, RecordingFinder } from "./RecordingFinder.tsx";
import { RecordingLink } from "./RecordingLink.tsx";
import { TaxonomyOptions } from "./TaxonomyOptions.tsx";
import { TrackListPanel } from "./TrackListPanel.tsx";

type EditionTracksPanelProps = {
  readonly messages: Messages;
  readonly stored: readonly EditionTrack[];
  readonly controls: EditionEditorControls;
  readonly picker: RecordingPickerControls;
  readonly onOpenRecording: (recordingId: string) => void;
};

function TrackAddForm({ messages, controls, picker }: Pick<EditionTracksPanelProps, "messages" | "controls" | "picker">) {
  const { t } = messages;
  return (
    <div class="stack inline-form">
      <h3>{t("tracks.add.heading")}</h3>
      <RecordingFinder messages={messages} picker={picker} />
      <form class="stack" data-testid="panel-editiontracks-add" onSubmit={(event) => controls.addTrack(formValuesOf(event), picker.state.results)}>
        <div class="field-row">
          <RecordingChoice messages={messages} picker={picker} optional />
          <DiscChoice messages={messages} discCount={controls.tracks.state.discs.length} />
        </div>
        <div class="field-row">
          <label class="field">
            <span>{t("tracks.add.title")}</span>
            <input name="title" maxLength={300} data-testid="input-tracks-title" />
          </label>
          <label class="field">
            <span>{t("tracks.inclusion")}</span>
            <select name="inclusion" data-testid="select-tracks-inclusion">
              <TaxonomyOptions messages={messages} taxonomy={trackInclusions} selected="core" />
            </select>
          </label>
        </div>
        <button type="submit" class="secondary" data-testid="button-editiontracks-add">{t("tracks.add.submit")}</button>
      </form>
    </div>
  );
}

export function EditionTracksPanel({ messages, stored, controls, picker, onOpenRecording }: EditionTracksPanelProps) {
  const { t } = messages;
  const { tracks } = controls;
  const fieldsOf = (track: EditionTrack, discIndex: number, position: number) => (
    <>
      {track.recording === null ? <p class="muted">{t("tracks.noRecording")}</p> : <RecordingLink messages={messages} recording={track.recording} testKey={`${discIndex}-${position}`} onOpen={onOpenRecording} />}
      <div class="field-row">
        <label class="field">
          <span>{t("tracks.title")}</span>
          <input value={track.title} required maxLength={300} data-testid={`input-track-title-${discIndex}-${position}`} onInput={(event) => tracks.change(discIndex, position, { title: event.currentTarget.value })} />
        </label>
        <label class="field">
          <span>{t("tracks.inclusion")}</span>
          <select value={track.inclusion} data-testid={`select-track-inclusion-${discIndex}-${position}`} onChange={(event) => tracks.change(discIndex, position, { inclusion: event.currentTarget.value })}>
            <TaxonomyOptions messages={messages} taxonomy={trackInclusions} />
          </select>
        </label>
      </div>
    </>
  );
  return (
    <TrackListPanel messages={messages} heading={t("edition.tracks.heading")} tracks={tracks} saving={controls.state.saving} onSave={controls.saveTracks} onDiscard={() => tracks.reset(stored)} fieldsOf={fieldsOf}>
      <TrackAddForm messages={messages} controls={controls} picker={picker} />
    </TrackListPanel>
  );
}
