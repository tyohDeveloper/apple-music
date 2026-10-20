// Creates a performer from the performer list and waits for its editor to open.
import { expect, type Page } from "@playwright/test";

export async function createPerformer(page: Page, kind: string, name: string, sortName = ""): Promise<void> {
  await page.getByTestId("select-performers-kind").selectOption(kind);
  await page.getByTestId("input-performers-name").fill(name);
  await page.getByTestId("input-performers-sortname").fill(sortName);
  await page.getByTestId("button-performers-create").click();
  await expect(page.getByTestId("text-performer-name")).toHaveText(name);
  await expect(page.getByTestId("select-performer-kind")).toHaveValue(kind);
}
