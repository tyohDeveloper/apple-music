// Performer screens: each binds a view to its controllers for one library.
import type { Route } from "../../routing/parseRoute.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { useCreditedRecordings } from "../controllers/useCreditedRecordings.ts";
import { usePerformerEditor } from "../controllers/usePerformerEditor.ts";
import { usePerformerList } from "../controllers/usePerformerList.ts";
import { usePerformerPicker } from "../controllers/usePerformerPicker.ts";
import { PerformerEditorView } from "./PerformerEditorView.tsx";
import { PerformersView } from "./PerformersView.tsx";

type ScreenProps = { readonly messages: Messages; readonly libraryId: string; readonly navigate: (route: Route) => void };

export function PerformersScreen({ messages, libraryId, navigate }: ScreenProps) {
  const controls = usePerformerList(libraryId, navigate);
  const onBack = (): void => navigate({ name: "library", libraryId });
  const onOpen = (performerId: string): void => navigate({ name: "performer", libraryId, performerId });
  return <PerformersView messages={messages} controls={controls} onBack={onBack} onOpen={onOpen} />;
}

export function PerformerScreen({ messages, libraryId, performerId, navigate }: ScreenProps & { readonly performerId: string }) {
  const controls = usePerformerEditor(libraryId, performerId, navigate);
  const picker = usePerformerPicker(libraryId);
  const credited = useCreditedRecordings(libraryId, performerId);
  const onBack = (): void => navigate({ name: "performers", libraryId });
  const onOpenPerformer = (otherId: string): void => navigate({ name: "performer", libraryId, performerId: otherId });
  const onOpenRecording = (recordingId: string): void => navigate({ name: "recording", libraryId, recordingId });
  const opening = { onBack, onOpenPerformer, onOpenRecording };
  return <PerformerEditorView messages={messages} controls={controls} picker={picker} credited={credited} {...opening} />;
}
