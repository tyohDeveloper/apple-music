// Signs in as the owner the e2e server seeds (OWNER_* in the environment) and opens the
// owner's seeded library, which is named after the owner's email.
import { expect, type Page } from "@playwright/test";

export const ownerEmail = process.env["OWNER_EMAIL"] ?? "";
const ownerPassword = process.env["OWNER_PASSWORD"] ?? "";

export async function signInAsOwner(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByTestId("input-signin-email").fill(ownerEmail);
  await page.getByTestId("input-signin-password").fill(ownerPassword);
  await page.getByTestId("button-signin-submit").click();
  await expect(page.getByTestId("display-header-user")).toBeVisible();
}

export async function openSeededLibrary(page: Page): Promise<void> {
  await page.getByTestId("panel-libraries-list").getByText(ownerEmail, { exact: true }).click();
  await expect(page.getByTestId("text-library-label")).toHaveText(ownerEmail);
}
