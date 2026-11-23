import { test, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("owner opens the simple example and exports a review", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Check my car park" })).toBeVisible();
  await page.getByRole("button", { name: "Open simple example" }).click();
  await expect(page.getByRole("heading", { name: /Wattle Reserve/ })).toBeVisible();
  await expect(page.getByText("No dataset problems found.")).toBeVisible();
  await expect(page.locator("#park-map polygon").first()).toBeVisible();
  await page.getByLabel("Organisation").fill("Fictional Reserve Office");
  await page.locator(".check").getByRole("button", { name: /wr\.ap1/ }).click();
  await page.getByRole("button", { name: "Confirmed" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export review" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("opms-review.json");
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});
