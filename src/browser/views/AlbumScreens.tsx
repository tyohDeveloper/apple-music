// Album and edition screens: each binds a view to its controllers for one library.
import type { Route } from "../../routing/parseRoute.ts";
import { useAlbumEditor } from "../controllers/useAlbumEditor.ts";
import { useAlbumList } from "../controllers/useAlbumList.ts";
import { useEditionEditor } from "../controllers/useEditionEditor.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { usePerformerPicker } from "../controllers/usePerformerPicker.ts";
import { useRecordingPicker } from "../controllers/useRecordingPicker.ts";
import { AlbumEditorView } from "./AlbumEditorView.tsx";
import { AlbumsView } from "./AlbumsView.tsx";
import { EditionEditorView } from "./EditionEditorView.tsx";

type ScreenProps = { readonly messages: Messages; readonly libraryId: string; readonly navigate: (route: Route) => void };

export function AlbumsScreen({ messages, libraryId, navigate }: ScreenProps) {
  const controls = useAlbumList(libraryId, navigate);
  const onOpen = (albumId: string): void => navigate({ name: "album", libraryId, albumId });
  return <AlbumsView messages={messages} controls={controls} onBack={() => navigate({ name: "library", libraryId })} onOpen={onOpen} />;
}

export function AlbumScreen({ messages, libraryId, albumId, navigate }: ScreenProps & { readonly albumId: string }) {
  const controls = useAlbumEditor(libraryId, albumId, navigate);
  const performerPicker = usePerformerPicker(libraryId);
  const recordingPicker = useRecordingPicker(libraryId);
  const navigation = {
    onBack: () => navigate({ name: "albums", libraryId }),
    onOpenPerformer: (performerId: string) => navigate({ name: "performer", libraryId, performerId }),
    onOpenRecording: (recordingId: string) => navigate({ name: "recording", libraryId, recordingId }),
    onOpenEdition: (editionId: string) => navigate({ name: "edition", libraryId, editionId }),
  };
  return <AlbumEditorView messages={messages} controls={controls} performerPicker={performerPicker} recordingPicker={recordingPicker} {...navigation} />;
}

export function EditionScreen({ messages, libraryId, editionId, navigate }: ScreenProps & { readonly editionId: string }) {
  const controls = useEditionEditor(libraryId, editionId, navigate);
  const picker = useRecordingPicker(libraryId);
  const onOpenAlbum = (albumId: string): void => navigate({ name: "album", libraryId, albumId });
  const onOpenRecording = (recordingId: string): void => navigate({ name: "recording", libraryId, recordingId });
  return <EditionEditorView messages={messages} controls={controls} picker={picker} onOpenAlbum={onOpenAlbum} onOpenRecording={onOpenRecording} />;
}
