// Finds recordings for a track: a search, then a choice among the first page of results.
import { formValuesOf } from "../controllers/formValuesOf.ts";
import type { Messages } from "../controllers/useMessages.ts";
import type { RecordingPickerControls } from "../controllers/useRecordingPicker.ts";

type RecordingFinderProps = { readonly messages: Messages; readonly picker: RecordingPickerControls };

export function RecordingFinder({ messages, picker }: RecordingFinderProps) {
  const { t } = messages;
  return (
    <>
      <form class="search-form" data-testid="panel-tracks-find" onSubmit={(event) => picker.search(formValuesOf(event))}>
        <label class="field">
          <span>{t("tracks.add.query")}</span>
          <input name="query" type="search" maxLength={200} data-testid="input-tracks-query" />
        </label>
        <button type="submit" class="secondary" data-testid="button-tracks-find">{t("tracks.add.find")}</button>
      </form>
      {picker.state.status === "loaded" && picker.state.results.length === 0 && <p data-testid="display-tracks-noresults">{t("tracks.add.noResults")}</p>}
    </>
  );
}

type RecordingChoiceProps = RecordingFinderProps & { readonly optional: boolean };

// The recording select of the add-track form, filled from the finder's results. Each search
// chooses its first result, even past an optional choice of no recording.
export function RecordingChoice({ messages, picker, optional }: RecordingChoiceProps) {
  const { t } = messages;
  return (
    <label class="field">
      <span>{t("tracks.add.recording")}</span>
      <select name="recordingId" required={!optional} data-testid="select-tracks-recording">
        {optional && <option value="">{t("tracks.add.noRecording")}</option>}
        {picker.state.results.map((result, index) => (
          <option key={result.id} value={result.id} selected={index === 0}>
            {result.creditLine === "" ? result.title : t("tracks.add.recordingBy", { title: result.title, line: result.creditLine })}
          </option>
        ))}
      </select>
    </label>
  );
}

type DiscChoiceProps = { readonly messages: Messages; readonly discCount: number };

// Which disc a new track goes on: the last disc unless the user picks another, or a new one.
export function DiscChoice({ messages, discCount }: DiscChoiceProps) {
  const { t } = messages;
  return (
    <label class="field">
      <span>{t("tracks.add.disc")}</span>
      <select name="disc" data-testid="select-tracks-disc">
        {Array.from({ length: discCount + 1 }, (_, index) => (
          <option key={index} value={String(index)} selected={index === Math.max(0, discCount - 1)}>
            {index === discCount ? t("tracks.add.newDisc", { number: messages.number(index + 1) }) : t("tracks.disc", { number: messages.number(index + 1) })}
          </option>
        ))}
      </select>
    </label>
  );
}
