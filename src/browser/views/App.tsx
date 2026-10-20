import type { Route } from "../../routing/parseRoute.ts";
import { useLibraries } from "../controllers/useLibraries.ts";
import { useMessages, type Messages } from "../controllers/useMessages.ts";
import { useRoute } from "../controllers/useRoute.ts";
import { useSession, type SessionControls } from "../controllers/useSession.ts";
import { AppHeader } from "./AppHeader.tsx";
import { LibrariesView } from "./LibrariesView.tsx";
import { LibraryHomeView } from "./LibraryHomeView.tsx";
import { NotFoundView } from "./NotFoundView.tsx";
import { PerformerScreen, PerformersScreen } from "./PerformerScreens.tsx";
import { RecordingScreen, RecordingsScreen } from "./RecordingScreens.tsx";
import { SignInView } from "./SignInView.tsx";

type SignedInScreenProps = {
  readonly messages: Messages;
  readonly route: Route;
  readonly navigate: (route: Route) => void;
};

type CatalogRoute = Extract<Route, { readonly name: "performers" | "performer" | "recordings" | "recording" }>;
type CatalogScreenProps = { readonly messages: Messages; readonly route: CatalogRoute; readonly navigate: (route: Route) => void };

function CatalogScreen({ messages, route, navigate }: CatalogScreenProps) {
  const { libraryId } = route;
  switch (route.name) {
    case "performers":
      return <PerformersScreen messages={messages} libraryId={libraryId} navigate={navigate} />;
    case "performer":
      return <PerformerScreen messages={messages} libraryId={libraryId} performerId={route.performerId} navigate={navigate} />;
    case "recordings":
      return <RecordingsScreen messages={messages} libraryId={libraryId} navigate={navigate} />;
    case "recording":
      return <RecordingScreen messages={messages} libraryId={libraryId} recordingId={route.recordingId} navigate={navigate} />;
  }
}

function SignedInScreen({ messages, route, navigate }: SignedInScreenProps) {
  const libraries = useLibraries(true);
  const toLibraries = (): void => navigate({ name: "libraries" });
  switch (route.name) {
    case "not-found":
      return <NotFoundView messages={messages} onBack={toLibraries} />;
    case "performers":
    case "performer":
    case "recordings":
    case "recording":
      return <CatalogScreen messages={messages} route={route} navigate={navigate} />;
    case "library": {
      const library = libraries.state.libraries.find((candidate) => candidate.id === route.libraryId) ?? null;
      const onOpen = (section: "performers" | "recordings"): void => navigate({ name: section, libraryId: route.libraryId });
      return <LibraryHomeView messages={messages} library={library} onBack={toLibraries} onOpen={onOpen} />;
    }
    default:
      return <LibrariesView messages={messages} state={libraries.state} onCreate={libraries.create} onOpen={(libraryId) => navigate({ name: "library", libraryId })} />;
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
