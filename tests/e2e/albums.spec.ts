// Flow: create two recordings and an album, build its intended track list and reorder it,
// issue an edition with a core track and an interview on a second disc, see that neither the
// album nor a recording on it can be deleted, and follow a track to its recording.
import { expect, test, type Page } from "@playwright/test";
import { createRecording } from "./support/createRecording.ts";
import { expectUniqueTestIds } from "./support/expectUniqueTestIds.ts";
import { openSeededLibrary, signInAsOwner } from "./support/signInAsOwner.ts";

async function openAlbums(page: Page): Promise<void> {
  await page.goto(page.url().replace(/\/libraries\/([^/]+).*$/u, "/libraries/$1/albums"));
  await expect(page.getByTestId("panel-albums-create")).toBeVisible();
}

async function findRecording(page: Page, query: string): Promise<void> {
  await page.getByTestId("input-tracks-query").fill(query);
  await page.getByTestId("button-tracks-find").click();
  await expect(page.getByTestId("select-tracks-recording")).toContainText(new RegExp(query, "iu"));
}

async function buildTrackList(page: Page): Promise<void> {
  await findRecording(page, "freddie");
  await page.getByTestId("button-albumtracks-add").click();
  await findRecording(page, "blue in green");
  await page.getByTestId("button-albumtracks-add").click();
  await page.getByTestId("input-track-label-0-0").fill("A2");
  await page.getByTestId("button-track-up-0-1").click();
  await expect(page.getByTestId("panel-track-0-0")).toContainText("Blue in Green");
  await page.getByTestId("button-tracks-save").click();
  await expect(page.getByTestId("display-tracks-unsaved")).toHaveCount(0);
  await expect(page.getByTestId("input-track-label-0-1")).toHaveValue("A2");
}

async function issueEdition(page: Page): Promise<void> {
  await page.getByTestId("input-editions-title").fill("Kind of Blue (Legacy Edition)");
  await page.getByTestId("select-editions-kind").selectOption("expanded");
  await page.getByTestId("button-editions-create").click();
  await expect(page.getByTestId("text-edition-title")).toHaveText("Kind of Blue (Legacy Edition)");
  await expect(page.getByTestId("select-edition-kind")).toHaveValue("expanded");
  await findRecording(page, "freddie");
  await page.getByTestId("button-editiontracks-add").click();
  await page.getByTestId("select-tracks-recording").selectOption("");
  await page.getByTestId("input-tracks-title").fill("Interview");
  await page.getByTestId("select-tracks-inclusion").selectOption("interview");
  await page.getByTestId("select-tracks-disc").selectOption("1");
  await page.getByTestId("button-editiontracks-add").click();
  await page.getByTestId("button-tracks-save").click();
  await expect(page.getByTestId("display-tracks-unsaved")).toHaveCount(0);
  await expect(page.getByTestId("input-track-title-0-0")).toHaveValue("Freddie Freeloader");
  await expect(page.getByTestId("input-track-title-1-0")).toHaveValue("Interview");
  await expectUniqueTestIds(page);
}

test("owner builds an album with an intended track list and an edition", async ({ page }) => {
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await page.getByTestId("button-library-recordings").click();
  await createRecording(page, "Freddie Freeloader");
  await page.getByTestId("button-recording-back").click();
  await createRecording(page, "Blue in Green");
  await openAlbums(page);
  await page.getByTestId("input-albums-title").fill("Kind of Blue");
  await page.getByTestId("input-albums-released").fill("1959-08-17");
  await page.getByTestId("button-albums-create").click();
  await expect(page.getByTestId("text-album-title")).toHaveText("Kind of Blue");
  await buildTrackList(page);
  await expectUniqueTestIds(page);
  await issueEdition(page);

  await page.getByTestId("button-edition-album").click();
  await expect(page.getByTestId("panel-editions-list")).toContainText("Tracks: 2");
  await page.getByTestId("button-delete-request").click();
  await page.getByTestId("button-delete-confirm").click();
  await expect(page.getByTestId("display-album-save-error")).toContainText("still in use");

  await page.getByTestId("button-track-recording-0-0").click();
  await expect(page.getByTestId("text-recording-title")).toHaveText("Blue in Green");
  await expect(page.getByTestId("panel-linkedalbums-results")).toContainText("Kind of Blue");
  await page.getByTestId("button-delete-request").click();
  await page.getByTestId("button-delete-confirm").click();
  await expect(page.getByTestId("display-recording-save-error")).toContainText("still in use");
  await expectUniqueTestIds(page);
});

test("an album without editions can be deleted", async ({ page }) => {
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await page.getByTestId("button-library-albums").click();
  await page.getByTestId("input-albums-title").fill("Sketches of Spain");
  await page.getByTestId("button-albums-create").click();
  await expect(page.getByTestId("text-album-title")).toHaveText("Sketches of Spain");
  await page.getByTestId("button-delete-request").click();
  await page.getByTestId("button-delete-confirm").click();
  await expect(page.getByTestId("panel-albums-create")).toBeVisible();
  await expect(page.getByTestId("panel-albums-results")).not.toContainText("Sketches of Spain");
});
