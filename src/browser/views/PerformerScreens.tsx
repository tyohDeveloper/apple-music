// Performer screens: each binds a view to its controllers for one library.
import type { Route } from "../../routing/parseRoute.ts";
import { useGenrePicker } from "../controllers/useGenrePicker.ts";
import { useLinkedAlbums } from "../controllers/useLinkedAlbums.ts";
import { useLinkedRecordings } from "../controllers/useLinkedRecordings.ts";
import type { Messages } from "../controllers/useMessages.ts";
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
  const credited = useLinkedRecordings(libraryId, { performerId });
  const albums = useLinkedAlbums(libraryId, { performerId });
  const genrePicker = useGenrePicker(libraryId);
  const opening = {
    onBack: () => navigate({ name: "performers", libraryId }),
    onOpenPerformer: (otherId: string) => navigate({ name: "performer", libraryId, performerId: otherId }),
    onOpenRecording: (recordingId: string) => navigate({ name: "recording", libraryId, recordingId }),
    onOpenAlbum: (albumId: string) => navigate({ name: "album", libraryId, albumId }),
    onOpenGenre: (genreId: string) => navigate({ name: "genre", libraryId, genreId }),
  };
  const lists = { credited, albums };
  return <PerformerEditorView messages={messages} controls={controls} picker={picker} genrePicker={genrePicker} {...lists} {...opening} />;
}
