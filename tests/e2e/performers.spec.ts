// Flow: create a band and a member, give the member a birth name, relate the member to the
// band, follow the relation, find the member by the birth name, and keep the preferred name.
import { expect, test, type Page } from "@playwright/test";
import { expectUniqueTestIds } from "./support/expectUniqueTestIds.ts";
import { openSeededLibrary, signInAsOwner } from "./support/signInAsOwner.ts";

async function createPerformer(page: Page, kind: string, name: string, sortName = ""): Promise<void> {
  await page.getByTestId("select-performers-kind").selectOption(kind);
  await page.getByTestId("input-performers-name").fill(name);
  await page.getByTestId("input-performers-sortname").fill(sortName);
  await page.getByTestId("button-performers-create").click();
  await expect(page.getByTestId("text-performer-name")).toHaveText(name);
}

test("owner curates performers with names and relations", async ({ page }) => {
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await page.getByTestId("button-library-performers").click();
  await expect(page.getByTestId("display-performers-empty")).toBeVisible();
  await createPerformer(page, "group", "The Velvet Underground", "Velvet Underground, The");
  await expectUniqueTestIds(page);
  await page.getByTestId("button-performer-back").click();
  await createPerformer(page, "person", "Lou Reed", "Reed, Lou");

  await page.getByTestId("input-names-name").fill("Lewis Allan Reed");
  await page.getByTestId("select-names-kind").selectOption("birth");
  await page.getByTestId("button-names-add").click();
  await expect(page.getByTestId("panel-names-list")).toContainText("Lewis Allan Reed");

  await page.getByTestId("input-relations-query").fill("velvet");
  await page.getByTestId("button-relations-find").click();
  await expect(page.getByTestId("select-relations-object")).toContainText("The Velvet Underground");
  await page.getByTestId("select-relations-kind").selectOption("member-of");
  await page.getByTestId("input-relations-roles").fill("vocals, guitar");
  await page.getByTestId("button-relations-add").click();
  await expect(page.getByTestId("panel-relations-list")).toContainText("vocals and guitar");
  await expectUniqueTestIds(page);

  await page.getByTestId("panel-relations-list").getByRole("button", { name: "The Velvet Underground" }).click();
  await expect(page.getByTestId("text-performer-name")).toHaveText("The Velvet Underground");
  await expect(page.getByTestId("panel-relations-list")).toContainText("Lou Reed");

  await page.getByTestId("button-performer-back").click();
  await page.getByTestId("input-performers-query").fill("lewis allan");
  await page.getByTestId("button-performers-search").click();
  await expect(page.getByTestId("panel-performers-results")).toContainText("Lou Reed");
  await expect(page.getByTestId("panel-performers-results")).not.toContainText("Velvet");
  await expect(page.getByTestId("display-pager-range")).toHaveText("1–1 of 1");
});

test("a performer keeps its preferred name and can be deleted", async ({ page }) => {
  await signInAsOwner(page);
  await openSeededLibrary(page);
  await page.getByTestId("button-library-performers").click();
  await createPerformer(page, "person", "Nina Simone");
  await page.getByTestId("input-names-name").fill("Eunice Kathleen Waymon");
  await page.getByTestId("select-names-kind").selectOption("birth");
  await page.getByTestId("checkbox-names-preferred").check();
  await page.getByTestId("button-names-add").click();
  await expect(page.getByTestId("text-performer-name")).toHaveText("Eunice Kathleen Waymon");
  await page.getByTestId("panel-names-list").getByRole("button", { name: "Make preferred" }).click();
  await expect(page.getByTestId("text-performer-name")).toHaveText("Nina Simone");

  await page.getByTestId("input-performer-began").fill("1933-02-30");
  await page.getByTestId("button-performer-save").click();
  await expect(page.getByTestId("display-performer-save-error")).toBeVisible();
  await page.getByTestId("input-performer-began").fill("1933-02-21");
  await page.getByTestId("button-performer-save").click();
  await expect(page.getByTestId("display-performer-save-error")).toHaveCount(0);

  await page.getByTestId("button-performer-delete").click();
  await page.getByTestId("button-performer-delete-confirm").click();
  await expect(page.getByTestId("panel-performers-results")).not.toContainText("Nina Simone");
});
