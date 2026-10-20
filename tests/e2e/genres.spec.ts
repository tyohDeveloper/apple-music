// Flow: build a small genre tree with an alias, see that a genre cannot go under its own
// subgenre, give a recording two genres in order, and see from the genre's page what
// carries it and that a genre in use cannot be deleted.
import { expect, test, type Page } from "@playwright/test";
import { createRecording } from "./support/createRecording.ts";
import { expectUniqueTestIds } from "./support/expectUniqueTestIds.ts";
import { openSeededLibrary, signInAsOwner } from "./support/signInAsOwner.ts";

async function findGenre(page: Page, query: string, expected: string): Promise<void> {
  await page.getByTestId("input-genrepick-query").fill(query);
  await page.getByTestId("button-genrepick-find").click();
  await expect(page.getByTestId("select-genrepick-genre")).toContainText(expected);
}

async function buildTree(page: Page): Promise<void> {
  await page.getByTestId("button-library-genres").click();
  await page.getByTestId("input-genres-name").fill("Jazz");
  await page.getByTestId("button-genres-create").click();
  await expect(page.getByTestId("text-genre-name")).toHaveText("Jazz");
  await page.getByTestId("input-subgenres-name").fill("Cool jazz");
  await page.getByTestId("button-subgenres-add").click();
  await page.getByTestId("panel-subgenres-list").getByRole("button", { name: "Cool jazz" }).click();
  await expect(page.getByTestId("text-genre-name")).toHaveText("Cool jazz");
  await expect(page.getByTestId("display-genre-path")).toHaveText("Jazz");
  await page.getByTestId("input-aliases-name").fill("West Coast jazz");
  await page.getByTestId("button-aliases-add").click();
  await expect(page.getByTestId("panel-aliases-list")).toContainText("West Coast jazz");
  await expectUniqueTestIds(page);
}

test("owner builds a genre tree and gives a recording its genres", async ({ page }) => {
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await buildTree(page);

  await page.getByTestId("button-genre-ancestor-0").click();
  await expect(page.getByTestId("text-genre-name")).toHaveText("Jazz");
  await findGenre(page, "cool", "Jazz › Cool jazz");
  await page.getByTestId("button-genre-move").click();
  await expect(page.getByTestId("display-genre-save-error")).toContainText("cannot go under itself");

  await page.getByTestId("button-genre-back").click();
  await page.getByTestId("input-genres-query").fill("west coast");
  await page.getByTestId("button-genres-search").click();
  await expect(page.getByTestId("panel-genres-results")).toContainText("Under Jazz");

  await page.getByTestId("button-genres-back").click();
  await page.getByTestId("button-library-recordings").click();
  await createRecording(page, "Boplicity");
  await findGenre(page, "cool", "Jazz › Cool jazz");
  await page.getByTestId("button-assigned-add").click();
  await expect(page.getByTestId("panel-assigned-list")).toContainText("Cool jazzMain genre");
  await findGenre(page, "jazz", "Jazz");
  await page.getByTestId("select-genrepick-genre").selectOption({ label: "Jazz" });
  await page.getByTestId("button-assigned-add").click();
  await page.getByTestId("button-assigned-up-1").click();
  await expect(page.getByTestId("button-assigned-open-0")).toHaveText("Jazz");
  await expect(page.getByTestId("button-assigned-open-1")).toHaveText("Cool jazz");
  await expectUniqueTestIds(page);

  await page.getByTestId("button-assigned-open-1").click();
  await expect(page.getByTestId("text-genre-name")).toHaveText("Cool jazz");
  await expect(page.getByTestId("panel-linkedrecordings-results")).toContainText("Boplicity");
  await page.getByTestId("button-delete-request").click();
  await page.getByTestId("button-delete-confirm").click();
  await expect(page.getByTestId("display-genre-save-error")).toContainText("still in use");
});
