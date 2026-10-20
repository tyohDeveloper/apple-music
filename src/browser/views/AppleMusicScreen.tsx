// The Apple Music screen: binds the connection view to its controller for one library.
import type { LibrarySummary } from "../../contracts/libraries/librarySummarySchema.ts";
import type { Route } from "../../routing/parseRoute.ts";
import { useAppleMusicConnection } from "../controllers/useAppleMusicConnection.ts";
import type { Messages } from "../controllers/useMessages.ts";
import { AppleMusicView } from "./AppleMusicView.tsx";

type AppleMusicScreenProps = {
  readonly messages: Messages;
  readonly library: LibrarySummary | null;
  readonly libraryId: string;
  readonly navigate: (route: Route) => void;
};

export function AppleMusicScreen({ messages, library, libraryId, navigate }: AppleMusicScreenProps) {
  const controls = useAppleMusicConnection(libraryId);
  return <AppleMusicView messages={messages} library={library} controls={controls} onBack={() => navigate({ name: "library", libraryId })} />;
}
