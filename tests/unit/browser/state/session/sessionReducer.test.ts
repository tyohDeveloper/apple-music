import { describe, expect, it } from "vitest";
import {
  sessionChecked,
  signedOut,
  signInFailed,
  signInStarted,
  signInSucceeded,
} from "../../../../../src/browser/state/session/sessionActions.ts";
import { initialSessionState, sessionReducer } from "../../../../../src/browser/state/session/sessionReducer.ts";

const user = { id: "u1", name: "Ann", email: "ann@example.test" };

describe("sessionReducer", () => {
  it("session/checked with a user signs in; without one signs out", () => {
    expect(sessionReducer(initialSessionState, sessionChecked(user))).toEqual({ status: "signed-in", user, failure: null });
    expect(sessionReducer(initialSessionState, sessionChecked(null)).status).toBe("signed-out");
  });
  it("session/sign-in-started clears the previous failure", () => {
    const failed = { status: "signed-out" as const, user: null, failure: "network" };
    expect(sessionReducer(failed, signInStarted())).toEqual({ status: "signing-in", user: null, failure: null });
  });
  it("session/sign-in-succeeded stores the user", () => {
    expect(sessionReducer(initialSessionState, signInSucceeded(user)).user).toEqual(user);
  });
  it("session/sign-in-failed records the failure", () => {
    expect(sessionReducer(initialSessionState, signInFailed("sign-in-rejected"))).toEqual({
      status: "signed-out",
      user: null,
      failure: "sign-in-rejected",
    });
  });
  it("session/signed-out forgets the user", () => {
    const signedIn = sessionReducer(initialSessionState, signInSucceeded(user));
    expect(sessionReducer(signedIn, signedOut())).toEqual({ status: "signed-out", user: null, failure: null });
  });
});
