// Flow: create two performers and a recording, credit both in order with a join phrase and
// an alternate name, preview and discard a reordering, follow a credit to the performer,
// see the performer cannot be deleted while credited, and find the recording by that name.
import { expect, test, type Page } from "@playwright/test";
import { createPerformer } from "./support/createPerformer.ts";
import { expectUniqueTestIds } from "./support/expectUniqueTestIds.ts";
import { openSeededLibrary, signInAsOwner } from "./support/signInAsOwner.ts";

async function openRecordings(page: Page): Promise<void> {
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await page.getByTestId("button-library-recordings").click();
  await expect(page.getByTestId("panel-recordings-create")).toBeVisible();
}

async function createRecording(page: Page, title: string): Promise<void> {
  await page.getByTestId("input-recordings-title").fill(title);
  await page.getByTestId("select-recordings-kind").selectOption("studio");
  await page.getByTestId("button-recordings-create").click();
  await expect(page.getByTestId("text-recording-title")).toHaveText(title);
}

async function addCredit(page: Page, query: string, role: string): Promise<void> {
  await page.getByTestId("input-credits-query").fill(query);
  await page.getByTestId("button-credits-find").click();
  await expect(page.getByTestId("button-credits-add")).toBeEnabled();
  await page.getByTestId("select-credits-role").selectOption(role);
  await page.getByTestId("button-credits-add").click();
}

test("owner credits performers on a recording", async ({ page }) => {
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await page.getByTestId("button-library-performers").click();
  await createPerformer(page, "person", "Miles Davis", "Davis, Miles");
  await page.getByTestId("button-performer-back").click();
  await createPerformer(page, "person", "John Coltrane", "Coltrane, John");
  await page.getByTestId("input-names-name").fill("Trane");
  await page.getByTestId("select-names-kind").selectOption("alias");
  await page.getByTestId("button-names-add").click();
  await expect(page.getByTestId("panel-names-list")).toContainText("Trane");

  await page.goto(page.url().replace(/performers\/.*$/u, "recordings"));
  await createRecording(page, "So What");
  await page.getByTestId("input-recording-recordedfrom").fill("1959-03-02");
  await page.getByTestId("input-recording-duration").fill("9:22");
  await page.getByTestId("button-recording-save").click();
  await expect(page.getByTestId("input-recording-duration")).toHaveValue("9:22");
  await expect(page.getByTestId("display-recording-save-error")).toHaveCount(0);

  await addCredit(page, "miles", "primary");
  await page.getByTestId("input-credit-join-0").fill(" with ");
  await addCredit(page, "coltrane", "primary");
  await expect(page.getByTestId("select-credit-name-1")).toContainText("Trane");
  await page.getByTestId("select-credit-name-1").selectOption({ label: "Trane" });
  await expect(page.getByTestId("display-credits-line")).toHaveText("Shown as: Miles Davis with Trane");
  await page.getByTestId("button-credits-save").click();
  await expect(page.getByTestId("display-credits-unsaved")).toHaveCount(0);
  await expect(page.getByTestId("text-recording-creditline")).toHaveText("Miles Davis with Trane");
  await expectUniqueTestIds(page);

  await page.getByTestId("button-credit-up-1").click();
  await expect(page.getByTestId("display-credits-line")).toHaveText("Shown as: Trane, Miles Davis");
  await page.getByTestId("button-credits-discard").click();
  await expect(page.getByTestId("display-credits-line")).toHaveText("Shown as: Miles Davis with Trane");

  await page.getByTestId("button-credit-performer-0").click();
  await expect(page.getByTestId("text-performer-name")).toHaveText("Miles Davis");
  await expect(page.getByTestId("panel-credited-results")).toContainText("So What");
  await page.getByTestId("button-delete-request").click();
  await page.getByTestId("button-delete-confirm").click();
  await expect(page.getByTestId("display-performer-save-error")).toContainText("still in use");
  await expectUniqueTestIds(page);

  await page.getByTestId("panel-credited-results").getByRole("button", { name: /So What/u }).click();
  await page.getByTestId("button-recording-back").click();
  await page.getByTestId("input-recordings-query").fill("trane");
  await page.getByTestId("button-recordings-search").click();
  await expect(page.getByTestId("panel-recordings-results")).toContainText("So What");
  await expect(page.getByTestId("panel-recordings-results")).toContainText("9:22");
});

test("a recording can be deleted", async ({ page }) => {
  await openRecordings(page);
  await createRecording(page, "Blue in Green");
  await page.getByTestId("button-delete-request").click();
  await page.getByTestId("button-delete-confirm").click();
  await expect(page.getByTestId("panel-recordings-create")).toBeVisible();
  await expect(page.getByTestId("panel-recordings-results")).not.toContainText("Blue in Green");
});
