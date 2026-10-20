import { describe, expect, it } from "vitest";
import {
  appleMusicChanged,
  appleMusicChangeFailed,
  appleMusicChangeStarted,
  appleMusicLoaded,
  appleMusicLoadFailed,
} from "../../../../../src/browser/state/apple-music/appleMusicConnectionActions.ts";
import { appleMusicConnectionReducer, initialAppleMusicConnectionState } from "../../../../../src/browser/state/apple-music/appleMusicConnectionReducer.ts";

const notConnected = { status: "not-connected", storefront: null, connectedAt: null } as const;
const connected = { status: "connected", storefront: "us", connectedAt: "2026-10-19T21:00:00.000Z" } as const;

describe("appleMusicConnectionReducer", () => {
  it("apple-music/loaded stores the configuration and the connection", () => {
    expect(appleMusicConnectionReducer(initialAppleMusicConnectionState, appleMusicLoaded(true, notConnected))).toMatchObject({ status: "ready", configured: true, connection: notConnected });
  });
  it("apple-music/load-failed records the failure", () => {
    expect(appleMusicConnectionReducer(initialAppleMusicConnectionState, appleMusicLoadFailed("network"))).toMatchObject({ status: "failed", failure: "network" });
  });
  it("apple-music/change-started marks a change in progress and clears an earlier failure", () => {
    const failed = appleMusicConnectionReducer(initialAppleMusicConnectionState, appleMusicChangeFailed("apple-music-authorization-cancelled"));
    expect(appleMusicConnectionReducer(failed, appleMusicChangeStarted())).toMatchObject({ changing: true, failure: null });
  });
  it("apple-music/changed stores the new connection", () => {
    const changing = appleMusicConnectionReducer(appleMusicConnectionReducer(initialAppleMusicConnectionState, appleMusicLoaded(true, notConnected)), appleMusicChangeStarted());
    expect(appleMusicConnectionReducer(changing, appleMusicChanged(connected))).toMatchObject({ changing: false, connection: connected });
  });
  it("apple-music/change-failed keeps the connection and records the failure", () => {
    const loaded = appleMusicConnectionReducer(initialAppleMusicConnectionState, appleMusicLoaded(true, connected));
    expect(appleMusicConnectionReducer(appleMusicConnectionReducer(loaded, appleMusicChangeStarted()), appleMusicChangeFailed("apple-music-unavailable"))).toMatchObject({
      changing: false,
      connection: connected,
      failure: "apple-music-unavailable",
    });
  });
});
