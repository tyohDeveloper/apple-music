// Genre screens: each binds a view to its controllers for one library.
import type { Route } from "../../routing/parseRoute.ts";
import { useGenreEditor } from "../controllers/useGenreEditor.ts";
import { useGenreList } from "../controllers/useGenreList.ts";
import { useGenrePicker } from "../controllers/useGenrePicker.ts";
import { useLinkedAlbums } from "../controllers/useLinkedAlbums.ts";
import { useLinkedPerformers } from "../controllers/useLinkedPerformers.ts";
import { useLinkedRecordings } from "../controllers/useLinkedRecordings.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { GenreEditorView } from "./GenreEditorView.tsx";
import { GenresView } from "./GenresView.tsx";

type ScreenProps = { readonly messages: Messages; readonly libraryId: string; readonly navigate: (route: Route) => void };

export function GenresScreen({ messages, libraryId, navigate }: ScreenProps) {
  const controls = useGenreList(libraryId, navigate);
  const onOpen = (genreId: string): void => navigate({ name: "genre", libraryId, genreId });
  return <GenresView messages={messages} controls={controls} onBack={() => navigate({ name: "library", libraryId })} onOpen={onOpen} />;
}

export function GenreScreen({ messages, libraryId, genreId, navigate }: ScreenProps & { readonly genreId: string }) {
  const controls = useGenreEditor(libraryId, genreId, navigate);
  const picker = useGenrePicker(libraryId);
  const uses = {
    albums: useLinkedAlbums(libraryId, { genreId }),
    recordings: useLinkedRecordings(libraryId, { genreId }),
    performers: useLinkedPerformers(libraryId, { genreId }),
  };
  const navigation = {
    onBack: () => navigate({ name: "genres", libraryId }),
    onOpenGenre: (id: string) => navigate({ name: "genre", libraryId, genreId: id }),
    onOpenAlbum: (albumId: string) => navigate({ name: "album", libraryId, albumId }),
    onOpenRecording: (recordingId: string) => navigate({ name: "recording", libraryId, recordingId }),
    onOpenPerformer: (performerId: string) => navigate({ name: "performer", libraryId, performerId }),
  };
  return <GenreEditorView messages={messages} controls={controls} picker={picker} uses={uses} {...navigation} />;
}
