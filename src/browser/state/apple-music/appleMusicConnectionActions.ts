import type { AppleMusicConnection } from "../../../contracts/apple-music/appleMusicConnectionSchema.ts";

export type AppleMusicConnectionAction =
  | { readonly type: "apple-music/loaded"; readonly configured: boolean; readonly connection: AppleMusicConnection }
  | { readonly type: "apple-music/load-failed"; readonly failure: string }
  | { readonly type: "apple-music/change-started" }
  | { readonly type: "apple-music/changed"; readonly connection: AppleMusicConnection }
  | { readonly type: "apple-music/change-failed"; readonly failure: string };

export const appleMusicLoaded = (configured: boolean, connection: AppleMusicConnection): AppleMusicConnectionAction => ({
  type: "apple-music/loaded",
  configured,
  connection,
});
export const appleMusicLoadFailed = (failure: string): AppleMusicConnectionAction => ({ type: "apple-music/load-failed", failure });
export const appleMusicChangeStarted = (): AppleMusicConnectionAction => ({ type: "apple-music/change-started" });
export const appleMusicChanged = (connection: AppleMusicConnection): AppleMusicConnectionAction => ({ type: "apple-music/changed", connection });
export const appleMusicChangeFailed = (failure: string): AppleMusicConnectionAction => ({ type: "apple-music/change-failed", failure });
