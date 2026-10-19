// Session lifecycle: check on load, sign in, sign out.
import { useCallback, useEffect, useReducer } from "preact/hooks";
import { fetchSession, signInWithEmail, signOutSession } from "../server-api/sessionRequests.ts";
import { sessionChecked, signedOut, signInFailed, signInStarted, signInSucceeded } from "../state/session/sessionActions.ts";
import { initialSessionState, sessionReducer, type SessionState } from "../state/session/sessionReducer.ts";

export type SessionControls = {
  readonly state: SessionState;
  readonly signIn: (email: string, password: string) => void;
  readonly signOut: () => void;
};

export function useSession(): SessionControls {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  useEffect(() => {
    void fetchSession().then((result) => dispatch(sessionChecked(result.ok ? result.value : null)));
  }, []);
  const signIn = useCallback((email: string, password: string) => {
    dispatch(signInStarted());
    void signInWithEmail(email, password).then((result) =>
      dispatch(result.ok ? signInSucceeded(result.value) : signInFailed(result.code)),
    );
  }, []);
  const signOut = useCallback(() => {
    void signOutSession().then(() => dispatch(signedOut()));
  }, []);
  return { state, signIn, signOut };
}
