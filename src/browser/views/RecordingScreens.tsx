// Recording screens: each binds a view to its controllers for one library.
import type { Route } from "../../routing/parseRoute.ts";
import { useGenrePicker } from "../controllers/useGenrePicker.ts";
import { useLinkedAlbums } from "../controllers/useLinkedAlbums.ts";
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
  const genrePicker = useGenrePicker(libraryId);
  const albums = useLinkedAlbums(libraryId, { recordingId });
  const navigation = {
    onBack: () => navigate({ name: "recordings", libraryId }),
    onOpenPerformer: (performerId: string) => navigate({ name: "performer", libraryId, performerId }),
    onOpenAlbum: (albumId: string) => navigate({ name: "album", libraryId, albumId }),
    onOpenGenre: (genreId: string) => navigate({ name: "genre", libraryId, genreId }),
  };
  return <RecordingEditorView messages={messages} controls={controls} picker={picker} genrePicker={genrePicker} albums={albums} {...navigation} />;
}
