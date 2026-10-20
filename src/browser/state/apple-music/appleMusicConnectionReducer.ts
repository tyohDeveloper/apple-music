// The Apple Music screen of a library: whether the server is set up for Apple Music, the
// library's connection, and a connect or disconnect in progress or failed.
import type { AppleMusicConnection } from "../../../contracts/apple-music/appleMusicConnectionSchema.ts";
import type { AppleMusicConnectionAction } from "./appleMusicConnectionActions.ts";

export type AppleMusicConnectionState = {
  readonly status: "loading" | "ready" | "failed";
  readonly configured: boolean;
  readonly connection: AppleMusicConnection | null;
  readonly changing: boolean;
  readonly failure: string | null;
};

export const initialAppleMusicConnectionState: AppleMusicConnectionState = {
  status: "loading",
  configured: false,
  connection: null,
  changing: false,
  failure: null,
};

export function appleMusicConnectionReducer(state: AppleMusicConnectionState, action: AppleMusicConnectionAction): AppleMusicConnectionState {
  switch (action.type) {
    case "apple-music/loaded":
      return { ...state, status: "ready", configured: action.configured, connection: action.connection, failure: null };
    case "apple-music/load-failed":
      return { ...state, status: "failed", failure: action.failure };
    case "apple-music/change-started":
      return { ...state, changing: true, failure: null };
    case "apple-music/changed":
      return { ...state, changing: false, connection: action.connection };
    case "apple-music/change-failed":
      return { ...state, changing: false, failure: action.failure };
  }
}
