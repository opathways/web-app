import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Dashboard page has no detectable a11y violations", async ({ page }) => {
  await page.goto("http://localhost:3000/dashboard"); // assumes dev server
  await page.waitForLoadState('networkidle'); // wait for page to fully load
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
