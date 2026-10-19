import type { SessionUser } from "../../../contracts/session/sessionUser.ts";

export type SessionAction =
  | { readonly type: "session/checked"; readonly user: SessionUser | null }
  | { readonly type: "session/sign-in-started" }
  | { readonly type: "session/sign-in-succeeded"; readonly user: SessionUser }
  | { readonly type: "session/sign-in-failed"; readonly failure: string }
  | { readonly type: "session/signed-out" };

export const sessionChecked = (user: SessionUser | null): SessionAction => ({ type: "session/checked", user });
export const signInStarted = (): SessionAction => ({ type: "session/sign-in-started" });
export const signInSucceeded = (user: SessionUser): SessionAction => ({ type: "session/sign-in-succeeded", user });
export const signInFailed = (failure: string): SessionAction => ({ type: "session/sign-in-failed", failure });
export const signedOut = (): SessionAction => ({ type: "session/signed-out" });
