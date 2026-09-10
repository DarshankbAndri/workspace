import { test, expect } from '../../fixtures/cmms.fixture.js';

const routes = [
  '/dashboard', '/profile', '/equipment', '/equipment/new', '/vendors', '/vendors/new', '/vendor-amc', '/vendor-amc/create',
  '/maintenance/requests', '/maintenance/requests/new', '/maintenance/assignments', '/maintenance/my-assignments',
  '/maintenance/assignments/new', '/maintenance/downtime', '/maintenance/downtime/new', '/maintenance/preventive',
  '/maintenance/preventive/calendar', '/maintenance/preventive/new', '/approvals/pending', '/approvals/history', '/notifications',
  '/reports/equipment-history', '/reports/downtime-analysis', '/reports/equipment-cost', '/inventory/spare-parts',
  '/inventory/spare-parts/new', '/inventory/spare-approvals', '/inventory/spare-requests', '/inventory/reorders', '/hr/sites',
  '/hr/sites/new', '/hr/employees', '/hr/employees/new', '/admin/roles', '/admin/roles/new', '/admin/permissions',
  '/admin/user-roles', '/admin/approval-config', '/admin/notification-settings', '/admin/company', '/create-user',
];

test.describe('@ui @regression implemented UI route/API integration', () => {
  for (const route of routes) {
    test(`${route} renders without frontend exceptions or server errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
      page.on('response', (response) => {
        if (response.url().includes('/api/') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await page.locator('[role="progressbar"]').first().waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
      await expect(page.locator('body')).not.toContainText(/Internal Server Error|Application error|Unhandled Runtime Error/i);
      expect(errors).toEqual([]);
    });
  }
});
