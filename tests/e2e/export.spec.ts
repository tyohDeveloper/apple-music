// Flow: download the library's JSON export from the library home, under the name the server
// gives it, and find in it a recording made just before, with its identifier.
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { createRecording } from "./support/createRecording.ts";
import { openSeededLibrary, ownerEmail, signInAsOwner } from "./support/signInAsOwner.ts";

test("owner downloads the library's JSON export", async ({ page }) => {
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await page.getByTestId("button-library-recordings").click();
  await createRecording(page, "Exported recording");
  await page.getByTestId("select-identifiers-namespace").selectOption("isrc");
  await page.getByTestId("input-identifiers-value").fill("GB-AYE-65-00031");
  await page.getByTestId("button-identifiers-add").click();
  await expect(page.getByTestId("display-identifiers-value-0")).toContainText("GBAYE6500031");

  await page.getByTestId("tab-nav-libraries").click();
  await openSeededLibrary(page);
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("button-library-export").click()]);
  const stem = ownerEmail.toLowerCase().replace(/[^a-z0-9]+/gu, "-");
  expect(download.suggestedFilename()).toMatch(new RegExp(`^${stem}-\\d{4}-\\d{2}-\\d{2}\\.json$`, "u"));
  const document = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(document).toMatchObject({ format: "apple-music-library-export", formatVersion: 1, library: { label: ownerEmail } });
  const recording = document.recordings.find((entry: { title: string }) => entry.title === "Exported recording");
  expect(recording.externalIds).toEqual([{ namespace: "isrc", value: "GBAYE6500031" }]);
});
