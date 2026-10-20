// A library's Apple Music connection: loads whether the server is set up and the connection,
// connects (a developer token from this server, MusicKit authorization, then the Music User
// Token sent to the server once) and disconnects.
import { useCallback, useEffect, useReducer } from "preact/hooks";
import type { AppleMusicConnection } from "../../contracts/apple-music/appleMusicConnectionSchema.ts";
import { deleteConnection, fetchAppleMusicConfiguration, fetchConnection, fetchDeveloperToken, putConnection } from "../server-api/appleMusicRequests.ts";
import type { ApiResult } from "../server-api/requestJson.ts";
import {
  appleMusicChanged,
  appleMusicChangeFailed,
  appleMusicChangeStarted,
  appleMusicLoaded,
  appleMusicLoadFailed,
} from "../state/apple-music/appleMusicConnectionActions.ts";
import {
  appleMusicConnectionReducer,
  initialAppleMusicConnectionState,
  type AppleMusicConnectionState,
} from "../state/apple-music/appleMusicConnectionReducer.ts";
import { MusicKitFailure, musicUserTokenFrom } from "./musicKitAuthorization.ts";

export type AppleMusicConnectionControls = {
  readonly state: AppleMusicConnectionState;
  readonly connect: () => void;
  readonly disconnect: () => void;
};

const notConnected: AppleMusicConnection = { status: "not-connected", storefront: null, connectedAt: null };

async function connected(libraryId: string): Promise<ApiResult<AppleMusicConnection>> {
  const developerToken = await fetchDeveloperToken();
  if (!developerToken.ok) return developerToken;
  try {
    return await putConnection(libraryId, { musicUserToken: await musicUserTokenFrom(developerToken.value.token) });
  } catch (error) {
    return { ok: false, code: error instanceof MusicKitFailure ? error.code : "unexpected" };
  }
}

export function useAppleMusicConnection(libraryId: string): AppleMusicConnectionControls {
  const [state, dispatch] = useReducer(appleMusicConnectionReducer, initialAppleMusicConnectionState);
  useEffect(() => {
    void Promise.all([fetchAppleMusicConfiguration(), fetchConnection(libraryId)]).then(([configuration, connection]) => {
      if (!configuration.ok) dispatch(appleMusicLoadFailed(configuration.code));
      else if (!connection.ok) dispatch(appleMusicLoadFailed(connection.code));
      else dispatch(appleMusicLoaded(configuration.value.configured, connection.value));
    });
  }, [libraryId]);
  const change = useCallback((work: Promise<ApiResult<AppleMusicConnection>>) => {
    dispatch(appleMusicChangeStarted());
    void work.then((result) => dispatch(result.ok ? appleMusicChanged(result.value) : appleMusicChangeFailed(result.code)));
  }, []);
  const connect = useCallback(() => change(connected(libraryId)), [change, libraryId]);
  const disconnect = useCallback(() => change(deleteConnection(libraryId).then((result) => (result.ok ? { ok: true, value: notConnected } : result))), [change, libraryId]);
  return { state, connect, disconnect };
}
