// The intended track list of an album as being edited: each track plays one recording and
// may carry the number and title printed for it. Tracks are added from a recording search.
import type { AlbumTrack } from "../../contracts/albums/albumTrackSchema.ts";
import type { AlbumEditorControls } from "../controllers/useAlbumEditor.ts";
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { RecordingPickerControls } from "../controllers/useRecordingPicker.ts";
import { DiscChoice, RecordingChoice, RecordingFinder } from "./RecordingFinder.tsx";
import { RecordingLink } from "./RecordingLink.tsx";
import { TrackListPanel } from "./TrackListPanel.tsx";

type AlbumTracksPanelProps = {
  readonly messages: Messages;
  readonly stored: readonly AlbumTrack[];
  readonly controls: AlbumEditorControls;
  readonly picker: RecordingPickerControls;
  readonly onOpenRecording: (recordingId: string) => void;
};

const blankAsNull = (text: string): string | null => (text === "" ? null : text);

export function AlbumTracksPanel({ messages, stored, controls, picker, onOpenRecording }: AlbumTracksPanelProps) {
  const { t } = messages;
  const { tracks } = controls;
  const fieldsOf = (track: AlbumTrack, discIndex: number, position: number) => (
    <>
      <RecordingLink messages={messages} recording={track.recording} testKey={`${discIndex}-${position}`} onOpen={onOpenRecording} />
      <div class="field-row">
        <label class="field">
          <span>{t("tracks.label")}</span>
          <input value={track.label ?? ""} maxLength={20} data-testid={`input-track-label-${discIndex}-${position}`} onInput={(event) => tracks.change(discIndex, position, { label: blankAsNull(event.currentTarget.value) })} />
        </label>
        <label class="field">
          <span>{t("tracks.printedTitle")}</span>
          <input value={track.title ?? ""} maxLength={300} placeholder={track.recording.title} data-testid={`input-track-printedtitle-${discIndex}-${position}`} onInput={(event) => tracks.change(discIndex, position, { title: blankAsNull(event.currentTarget.value) })} />
        </label>
      </div>
    </>
  );
  return (
    <TrackListPanel messages={messages} heading={t("album.tracks.heading")} tracks={tracks} saving={controls.state.saving} onSave={controls.saveTracks} onDiscard={() => tracks.reset(stored)} fieldsOf={fieldsOf}>
      <div class="stack inline-form">
        <h3>{t("tracks.add.heading")}</h3>
        <RecordingFinder messages={messages} picker={picker} />
        <form class="stack" data-testid="panel-albumtracks-add" onSubmit={(event) => controls.addTrack(formValuesOf(event), picker.state.results)}>
          <div class="field-row">
            <RecordingChoice messages={messages} picker={picker} optional={false} />
            <DiscChoice messages={messages} discCount={tracks.state.discs.length} />
          </div>
          <button type="submit" class="secondary" disabled={picker.state.results.length === 0} data-testid="button-albumtracks-add">{t("tracks.add.submit")}</button>
        </form>
      </div>
    </TrackListPanel>
  );
}
