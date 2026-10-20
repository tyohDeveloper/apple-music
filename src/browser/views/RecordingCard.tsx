// One recording in a list: title and version, who is credited, kind, date and length.
import type { RecordingSummary } from "../../contracts/recordings/recordingSummarySchema.ts";
import type { Messages } from "../controllers/useMessages.ts";

type RecordingCardProps = { readonly messages: Messages; readonly recording: RecordingSummary; readonly onOpen: (recordingId: string) => void };

export function RecordingCard({ messages, recording, onOpen }: RecordingCardProps) {
  const facts = [
    messages.displayName("recordingKind", recording.kind),
    ...(recording.recordedFrom === null ? [] : [recording.recordedFrom]),
    ...(recording.durationMs === null ? [] : [messages.duration(recording.durationMs)]),
  ];
  return (
    <button type="button" class="card" data-testid={`button-recordings-open-${recording.id}`} onClick={() => onOpen(recording.id)}>
      <span class="card-title">
        {recording.title}
        {recording.versionNote !== null && <span class="muted"> ({recording.versionNote})</span>}
      </span>
      {recording.creditLine !== "" && <span class="card-meta">{recording.creditLine}</span>}
      <span class="card-meta">{facts.join(" · ")}</span>
    </button>
  );
}
