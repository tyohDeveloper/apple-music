// Flow: the owner connects the library to Apple Music through MusicKit, with Apple's script
// replaced by a stub that authorizes at once and the server talking to the Apple Music fake,
// sees the storefront Apple reported, reads the fake's fixture library into the mirror, and
// disconnects.
import { expect, test } from "@playwright/test";
import { fakeMusicUserToken } from "../support/appleMusicFake.ts";
import { openSeededLibrary, signInAsOwner } from "./support/signInAsOwner.ts";

const musicKitScript = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
const musicKitStub = `window.MusicKit = { configure: async () => ({ authorize: async () => ${JSON.stringify(fakeMusicUserToken)} }) };
document.dispatchEvent(new Event("musickitloaded"));`;

test("owner connects the library to Apple Music, reads it, and disconnects it", async ({ page }) => {
  await page.route(musicKitScript, (route) => route.fulfill({ contentType: "text/javascript", body: musicKitStub }));
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await page.getByTestId("button-library-applemusic").click();
  await expect(page.getByTestId("display-applemusic-notconnected")).toBeVisible();
  await page.getByTestId("button-applemusic-connect").click();
  await expect(page.getByTestId("display-applemusic-storefront")).toHaveText("Storefront: US");
  await page.reload();
  await expect(page.getByTestId("display-applemusic-connected")).toBeVisible();
  await expect(page.getByTestId("display-sync-status")).toHaveText("Not read yet.");
  await page.getByTestId("button-sync-start").click();
  await expect(page.getByTestId("display-sync-status")).toContainText("Last read on", { timeout: 15_000 });
  await expect(page.getByTestId("display-sync-count-songs")).toHaveText("5");
  await expect(page.getByTestId("display-sync-count-catalogalbums")).toHaveText("3");
  await expect(page.getByTestId("display-sync-count-added")).toHaveText("13");
  await page.getByTestId("button-applemusic-disconnect").click();
  await expect(page.getByTestId("display-applemusic-notconnected")).toBeVisible();
  await expect(page.getByTestId("display-applemusic-error")).toHaveCount(0);
});
