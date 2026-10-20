// Creates a recording from the recording list and waits for its editor to open.
import { expect, type Page } from "@playwright/test";

export async function createRecording(page: Page, title: string, kind = "studio"): Promise<void> {
  await page.getByTestId("input-recordings-title").fill(title);
  await page.getByTestId("select-recordings-kind").selectOption(kind);
  await page.getByTestId("button-recordings-create").click();
  await expect(page.getByTestId("text-recording-title")).toHaveText(title);
  await expect(page.getByTestId("select-recording-kind")).toHaveValue(kind);
}
