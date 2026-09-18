import { test, expect } from '../../fixtures/cmms.fixture.js';

test.describe('@smoke @ui critical UI smoke', () => {
  for (const route of ['/dashboard', '/hr/sites', '/equipment', '/maintenance/requests', '/inventory/spare-parts']) {
    test(`${route} loads without API or browser errors`, async ({ page }) => {
      const failures: string[] = [];
      page.on('pageerror', (error) => failures.push(`pageerror ${error.message}`));
      page.on('response', (response) => {
        if (response.url().includes('/api/') && response.status() >= 500) failures.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(route);
      await expect(page.locator('body')).not.toContainText(/Internal Server Error|Unable to load/i);
      expect(failures).toEqual([]);
    });
  }

  for (const [route, endpoint] of [
    ['/approvals/pending', '/api/approvals/pending/search'],
    ['/maintenance/my-assignments', '/api/maintenance/assignments/my/search'],
  ] as const) {
    test(`${route} uses its server-side search`, async ({ page }) => {
      const responsePromise = page.waitForResponse((response) => response.url().includes(endpoint));
      await page.goto(route);
      const response = await responsePromise;
      expect(response.status(), `${endpoint} must be implemented and successful`).toBe(200);
    });
  }
});
