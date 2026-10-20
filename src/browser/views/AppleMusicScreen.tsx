// The Apple Music screen: binds the connection view and, once the library is connected, the
// reading panel to their controllers for one library.
import type { LibrarySummary } from "../../contracts/libraries/librarySummarySchema.ts";
import type { Route } from "../../routing/parseRoute.ts";
import { useAppleMusicConnection } from "../controllers/useAppleMusicConnection.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { useSyncRun } from "../controllers/useSyncRun.ts";
import { AppleMusicView } from "./AppleMusicView.tsx";
import { SyncRunPanel } from "./SyncRunPanel.tsx";

type AppleMusicScreenProps = {
  readonly messages: Messages;
  readonly library: LibrarySummary | null;
  readonly libraryId: string;
  readonly navigate: (route: Route) => void;
};

export function AppleMusicScreen({ messages, library, libraryId, navigate }: AppleMusicScreenProps) {
  const controls = useAppleMusicConnection(libraryId);
  const connected = controls.state.connection?.status === "connected";
  const sync = useSyncRun(libraryId, connected);
  return (
    <>
      <AppleMusicView messages={messages} library={library} controls={controls} onBack={() => navigate({ name: "library", libraryId })} />
      {connected ? <SyncRunPanel messages={messages} role={library?.role ?? null} controls={sync} /> : null}
    </>
  );
}
