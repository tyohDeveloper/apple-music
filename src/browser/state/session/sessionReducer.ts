import type { SessionUser } from "../../../contracts/session/sessionUser.ts";
import type { SessionAction } from "./sessionActions.ts";

export type SessionState = {
  readonly status: "checking" | "signed-out" | "signing-in" | "signed-in";
  readonly user: SessionUser | null;
  readonly failure: string | null;
};

export const initialSessionState: SessionState = { status: "checking", user: null, failure: null };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "session/checked":
      return { status: action.user === null ? "signed-out" : "signed-in", user: action.user, failure: null };
    case "session/sign-in-started":
      return { ...state, status: "signing-in", failure: null };
    case "session/sign-in-succeeded":
      return { status: "signed-in", user: action.user, failure: null };
    case "session/sign-in-failed":
      return { status: "signed-out", user: null, failure: action.failure };
    case "session/signed-out":
      return { status: "signed-out", user: null, failure: null };
  }
}
