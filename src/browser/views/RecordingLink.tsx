// The recording a track plays, as a link to the recording, with its credit line and length.
import type { RecordingReference } from "../../contracts/recordings/recordingReferenceSchema.ts";
import type { Messages } from "../controllers/useMessages.ts";

type RecordingLinkProps = {
  readonly messages: Messages;
  readonly recording: RecordingReference;
  readonly testKey: string;
  readonly onOpen: (recordingId: string) => void;
};

export function RecordingLink({ messages, recording, testKey, onOpen }: RecordingLinkProps) {
  const { t } = messages;
  const facts = [...(recording.creditLine === "" ? [] : [recording.creditLine]), ...(recording.durationMs === null ? [] : [messages.duration(recording.durationMs)])];
  return (
    <div class="row-main">
      <button type="button" class="link-button" data-testid={`button-track-recording-${testKey}`} onClick={() => onOpen(recording.id)}>
        {recording.versionNote === null ? recording.title : t("tracks.recordingVersion", { title: recording.title, version: recording.versionNote })}
      </button>
      {facts.length > 0 && <span class="muted">{facts.join(" · ")}</span>}
    </div>
  );
}
