import type { Route } from "../../routing/parseRoute.ts";
import { useLibraries, type LibraryControls } from "../controllers/useLibraries.ts";
import { useMessages, type Messages } from "../controllers/useMessages.ts";
import { useRoute } from "../controllers/useRoute.ts";
import { useSession, type SessionControls } from "../controllers/useSession.ts";
import { AlbumScreen, AlbumsScreen, EditionScreen } from "./AlbumScreens.tsx";
import { AppHeader } from "./AppHeader.tsx";
import { AppleMusicScreen } from "./AppleMusicScreen.tsx";
import { GenreScreen, GenresScreen } from "./GenreScreens.tsx";
import { LibrariesView } from "./LibrariesView.tsx";
import { LibraryHomeView, type LibrarySection } from "./LibraryHomeView.tsx";
import { NotFoundView } from "./NotFoundView.tsx";
import { PerformerScreen, PerformersScreen } from "./PerformerScreens.tsx";
import { RecordingScreen, RecordingsScreen } from "./RecordingScreens.tsx";
import { SignInView } from "./SignInView.tsx";

type SignedInScreenProps = {
  readonly messages: Messages;
  readonly route: Route;
  readonly navigate: (route: Route) => void;
};

type LibraryRoute = Extract<Route, { readonly name: "library" | "apple-music" }>;
type CatalogRoute = Exclude<Route, { readonly name: "sign-in" | "libraries" | "library" | "apple-music" | "not-found" }>;
type ListRoute = Extract<CatalogRoute, { readonly name: "performers" | "recordings" | "albums" | "genres" }>;
type EntityRoute = Exclude<CatalogRoute, ListRoute>;
type ScreenProps<R> = { readonly messages: Messages; readonly route: R; readonly navigate: (route: Route) => void };

const listNames: readonly string[] = ["performers", "recordings", "albums", "genres"];

function isListRoute(route: CatalogRoute): route is ListRoute {
  return listNames.includes(route.name);
}

function ListScreen({ messages, route, navigate }: ScreenProps<ListRoute>) {
  const screen = { messages, libraryId: route.libraryId, navigate };
  switch (route.name) {
    case "performers":
      return <PerformersScreen {...screen} />;
    case "recordings":
      return <RecordingsScreen {...screen} />;
    case "albums":
      return <AlbumsScreen {...screen} />;
    case "genres":
      return <GenresScreen {...screen} />;
  }
}

function EntityScreen({ messages, route, navigate }: ScreenProps<EntityRoute>) {
  const screen = { messages, libraryId: route.libraryId, navigate };
  switch (route.name) {
    case "performer":
      return <PerformerScreen {...screen} performerId={route.performerId} />;
    case "recording":
      return <RecordingScreen {...screen} recordingId={route.recordingId} />;
    case "album":
      return <AlbumScreen {...screen} albumId={route.albumId} />;
    case "edition":
      return <EditionScreen {...screen} editionId={route.editionId} />;
    case "genre":
      return <GenreScreen {...screen} genreId={route.genreId} />;
  }
}

function CatalogScreen({ messages, route, navigate }: ScreenProps<CatalogRoute>) {
  return isListRoute(route) ? <ListScreen messages={messages} route={route} navigate={navigate} /> : <EntityScreen messages={messages} route={route} navigate={navigate} />;
}

// A library's home and its Apple Music connection, which need the library's summary.
function LibraryScreen({ messages, route, navigate, libraries }: ScreenProps<LibraryRoute> & { readonly libraries: LibraryControls }) {
  const { libraryId } = route;
  const library = libraries.state.libraries.find((candidate) => candidate.id === libraryId) ?? null;
  if (route.name === "apple-music") return <AppleMusicScreen messages={messages} library={library} libraryId={libraryId} navigate={navigate} />;
  const onOpen = (section: LibrarySection): void => navigate({ name: section, libraryId });
  const toLibraries = (): void => navigate({ name: "libraries" });
  return <LibraryHomeView messages={messages} library={library} exportHref={libraries.exportHrefOf(libraryId)} onBack={toLibraries} onOpen={onOpen} />;
}

function SignedInScreen({ messages, route, navigate }: SignedInScreenProps) {
  const libraries = useLibraries(true);
  const toLibraries = (): void => navigate({ name: "libraries" });
  switch (route.name) {
    case "not-found":
      return <NotFoundView messages={messages} onBack={toLibraries} />;
    case "libraries":
    case "sign-in":
      return <LibrariesView messages={messages} state={libraries.state} onCreate={libraries.create} onOpen={(libraryId) => navigate({ name: "library", libraryId })} />;
    case "library":
    case "apple-music":
      return <LibraryScreen messages={messages} route={route} navigate={navigate} libraries={libraries} />;
    default:
      return <CatalogScreen messages={messages} route={route} navigate={navigate} />;
  }
}

function AppScreen({ messages, session, route, navigate }: SignedInScreenProps & { readonly session: SessionControls }) {
  if (session.state.status === "checking") return <p data-testid="display-app-loading">{messages.t("app.loading")}</p>;
  if (session.state.user === null) return <SignInView messages={messages} state={session.state} onSignIn={session.signIn} />;
  return <SignedInScreen messages={messages} route={route} navigate={navigate} />;
}

export function App() {
  const messages = useMessages();
  const session = useSession();
  const { route, navigate } = useRoute();
  return (
    <div class="app-shell">
      <AppHeader messages={messages} user={session.state.user} onNavigate={navigate} onSignOut={session.signOut} />
      <main class="app-main" data-testid="panel-app-main">
        <AppScreen messages={messages} session={session} route={route} navigate={navigate} />
      </main>
    </div>
  );
}
