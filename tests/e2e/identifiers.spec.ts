// Flow: give a recording an ISRC typed with hyphens and see it stored normalized, see a
// malformed one flagged on the field and kept for correction, link a MusicBrainz id to its
// page, and remove an identifier.
import { expect, test, type Page } from "@playwright/test";
import { createRecording } from "./support/createRecording.ts";
import { expectUniqueTestIds } from "./support/expectUniqueTestIds.ts";
import { openSeededLibrary, signInAsOwner } from "./support/signInAsOwner.ts";

async function addIdentifier(page: Page, namespace: string, value: string): Promise<void> {
  await page.getByTestId("select-identifiers-namespace").selectOption(namespace);
  await page.getByTestId("input-identifiers-value").fill(value);
  await page.getByTestId("button-identifiers-add").click();
}

test("owner records a recording's identifiers", async ({ page }) => {
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await page.getByTestId("button-library-recordings").click();
  await createRecording(page, "Milestones");
  await expect(page.getByTestId("display-identifiers-empty")).toBeVisible();

  await addIdentifier(page, "isrc", "us-sm1-58-00327");
  await expect(page.getByTestId("display-identifiers-value-0")).toHaveText("ISRCUSSM15800327");
  await expect(page.getByTestId("input-identifiers-value")).toHaveValue("");

  await addIdentifier(page, "isrc", "USSM158");
  const value = page.getByTestId("input-identifiers-value");
  await expect(value).toHaveJSProperty("validationMessage", "That identifier does not have the form its system uses.");
  await expect(value).toHaveValue("USSM158");
  await expect(page.getByTestId("panel-identifiers-list").getByRole("listitem")).toHaveCount(1);

  await addIdentifier(page, "musicbrainz", "9E0A2D4E-1C2B-4F6A-8D3E-5B7C9A1E2F30");
  const link = page.getByTestId("button-identifiers-open-1");
  await expect(link).toHaveAttribute("href", "https://musicbrainz.org/recording/9e0a2d4e-1c2b-4f6a-8d3e-5b7c9a1e2f30");
  await expectUniqueTestIds(page);

  await page.getByTestId("button-identifiers-remove-0").click();
  await expect(page.getByTestId("display-identifiers-value-0")).toContainText("MusicBrainz");
  await expect(page.getByTestId("panel-identifiers-list").getByRole("listitem")).toHaveCount(1);
});
