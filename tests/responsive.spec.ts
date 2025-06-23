import { test, expect } from "@playwright/test";

test.describe("Responsive shell", () => {
  test("mobile layout hides sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("http://localhost:3000/dashboard");
    const sidebar = page.locator("aside");       // SidebarNav
    await expect(sidebar).toBeHidden();
    const htmlWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewport = await page.evaluate(() => window.innerWidth);
    expect(htmlWidth).toBeLessThanOrEqual(viewport);
  });

  test("tablet layout is responsive", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("http://localhost:3000/login");
    const htmlWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewport = await page.evaluate(() => window.innerWidth);
    expect(htmlWidth).toBeLessThanOrEqual(viewport);
  });

  test("desktop layout is responsive", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("http://localhost:3000/login");
    const htmlWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewport = await page.evaluate(() => window.innerWidth);
    expect(htmlWidth).toBeLessThanOrEqual(viewport);
  });
});
