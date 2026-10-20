// Recording screens: each binds a view to its controllers for one library.
import type { Route } from "../../routing/parseRoute.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { usePerformerPicker } from "../controllers/usePerformerPicker.ts";
import { useRecordingEditor } from "../controllers/useRecordingEditor.ts";
import { useRecordingList } from "../controllers/useRecordingList.ts";
import { RecordingEditorView } from "./RecordingEditorView.tsx";
import { RecordingsView } from "./RecordingsView.tsx";

type ScreenProps = { readonly messages: Messages; readonly libraryId: string; readonly navigate: (route: Route) => void };

export function RecordingsScreen({ messages, libraryId, navigate }: ScreenProps) {
  const controls = useRecordingList(libraryId, navigate);
  const onBack = (): void => navigate({ name: "library", libraryId });
  const onOpen = (recordingId: string): void => navigate({ name: "recording", libraryId, recordingId });
  return <RecordingsView messages={messages} controls={controls} onBack={onBack} onOpen={onOpen} />;
}

export function RecordingScreen({ messages, libraryId, recordingId, navigate }: ScreenProps & { readonly recordingId: string }) {
  const controls = useRecordingEditor(libraryId, recordingId, navigate);
  const picker = usePerformerPicker(libraryId);
  const onBack = (): void => navigate({ name: "recordings", libraryId });
  const onOpenPerformer = (performerId: string): void => navigate({ name: "performer", libraryId, performerId });
  return <RecordingEditorView messages={messages} controls={controls} picker={picker} onBack={onBack} onOpenPerformer={onOpenPerformer} />;
}
