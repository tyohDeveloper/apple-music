// Searches a catalog list and waits for it to report no match, so a check that something is
// gone cannot pass while the list is still loading.
import { expect, type Page } from "@playwright/test";

export async function expectNoneFound(page: Page, list: "albums" | "performers" | "recordings", query: string): Promise<void> {
  await page.getByTestId(`input-${list}-query`).fill(query);
  await page.getByTestId(`button-${list}-search`).click();
  await expect(page.getByTestId(`display-${list}-empty`)).toBeVisible();
}
