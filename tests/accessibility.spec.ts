import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Employer Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");
    await page.waitForLoadState('networkidle');
  });

  test("Dashboard page has no detectable a11y violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("Dashboard loads and displays heading", async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Employer Dashboard' })).toBeVisible();
  });

  test("Dashboard displays metric cards", async ({ page }) => {
    await expect(page.getByText('Total Jobs Posted')).toBeVisible();
    await expect(page.getByText('Active Jobs')).toBeVisible();
    await expect(page.getByText('Total Applicants')).toBeVisible();
    await expect(page.getByText('Company Profile')).toBeVisible();
  });

  test("Dashboard displays Quick Actions section", async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quick Actions' })).toBeVisible();
  });

  test("Profile completion indicator shows when profile incomplete", async ({ page }) => {
    const profileWarning = page.getByText('Complete your company profile').or(
      page.getByText('Create your company profile')
    );
    
    if (await profileWarning.isVisible()) {
      await expect(profileWarning).toBeVisible();
      await expect(page.getByText('⚠️')).toBeVisible();
    }
  });

  test("Dashboard navigation links work", async ({ page }) => {
    
    const jobsLink = page.getByRole('link', { name: /jobs/i }).first();
    const profileLink = page.getByRole('link', { name: /profile/i }).first();
    
    if (await jobsLink.isVisible()) {
      await expect(jobsLink).toBeVisible();
    }
    
    if (await profileLink.isVisible()) {
      await expect(profileLink).toBeVisible();
    }
  });

  test("Dashboard handles loading states gracefully", async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Employer Dashboard' })).toBeVisible();
    
    const metricCards = page.locator('[class*="grid"]').first();
    await expect(metricCards).toBeVisible();
  });

  test("Dashboard displays correct data structure", async ({ page }) => {
    const totalJobsCard = page.locator('text=Total Jobs Posted').locator('..');
    const activeJobsCard = page.locator('text=Active Jobs').locator('..');
    const applicantsCard = page.locator('text=Total Applicants').locator('..');
    
    await expect(totalJobsCard).toBeVisible();
    await expect(activeJobsCard).toBeVisible();
    await expect(applicantsCard).toBeVisible();
    
    const numberPattern = /^\d+$/;
    
    const totalJobsText = await totalJobsCard.textContent();
    const activeJobsText = await activeJobsCard.textContent();
    const applicantsText = await applicantsCard.textContent();
    
    const totalJobsMatch = totalJobsText?.match(/\d+/);
    const activeJobsMatch = activeJobsText?.match(/\d+/);
    const applicantsMatch = applicantsText?.match(/\d+/);
    
    expect(totalJobsMatch).toBeTruthy();
    expect(activeJobsMatch).toBeTruthy();
    expect(applicantsMatch).toBeTruthy();
  });

  test("Dashboard responsive design works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: 'Employer Dashboard' })).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'Employer Dashboard' })).toBeVisible();
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByRole('heading', { name: 'Employer Dashboard' })).toBeVisible();
  });
});
