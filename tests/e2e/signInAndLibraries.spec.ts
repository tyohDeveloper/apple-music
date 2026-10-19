// Flows: sign in (rejected and accepted), list libraries, create one, open it, sign out.
import { expect, test } from "@playwright/test";
import { expectUniqueTestIds } from "./support/expectUniqueTestIds.ts";
import { signInAsOwner } from "./support/signInAsOwner.ts";

const email = process.env["OWNER_EMAIL"] ?? "";
const password = process.env["OWNER_PASSWORD"] ?? "";

test("owner signs in, creates and opens a library, and signs out", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("panel-signin-form")).toBeVisible();
  await expectUniqueTestIds(page);

  await page.getByTestId("input-signin-email").fill(email);
  await page.getByTestId("input-signin-password").fill("not-the-password");
  await page.getByTestId("button-signin-submit").click();
  await expect(page.getByTestId("display-signin-error")).toBeVisible();

  await page.getByTestId("input-signin-password").fill(password);
  await page.getByTestId("button-signin-submit").click();
  await expect(page.getByTestId("display-header-user")).toBeVisible();
  await expect(page.getByTestId("panel-libraries-list")).toContainText(email);
  await expectUniqueTestIds(page);

  await page.getByTestId("input-libraries-label").fill("Family Apple ID");
  await page.getByTestId("button-libraries-create").click();
  const created = page.getByTestId("panel-libraries-list").getByText("Family Apple ID");
  await expect(created).toBeVisible();
  await created.click();
  await expect(page.getByTestId("text-library-label")).toHaveText("Family Apple ID");
  await expectUniqueTestIds(page);

  await page.getByTestId("button-library-back").click();
  await page.getByTestId("button-header-signout").click();
  await expect(page.getByTestId("panel-signin-form")).toBeVisible();
});

test("unknown paths show the not-found screen", async ({ page }) => {
  await signInAsOwner(page);
  await page.goto("/somewhere-else");
  await page.getByTestId("button-notfound-back").click();
  await expect(page.getByTestId("panel-libraries-list")).toBeVisible();
});
