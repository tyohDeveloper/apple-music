// §4.3: every data-testid in the rendered page is unique.
import { expect, type Page } from "@playwright/test";

export async function expectUniqueTestIds(page: Page): Promise<void> {
  const ids = await page.locator("[data-testid]").evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-testid") ?? ""),
  );
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  expect(duplicates).toEqual([]);
}
