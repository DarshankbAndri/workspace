import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createAccount } from '../../fixtures/accounts.js';
import { siteData } from '../../data/factories.js';
import type { Entity } from '../../fixtures/core-data.js';
import { env } from '../../helpers/env.js';

test('@ui @regression site form creates, list opens view, and edits persist', async ({ page, api, resources, runId }) => {
  const payload = siteData(runId);
  await page.goto('/hr/sites/new');
  await page.getByLabel('Site Code', { exact: false }).fill(payload.siteCode);
  await page.getByLabel('Site Name', { exact: false }).fill(payload.siteName);
  const saved = page.waitForResponse((response) => response.url().endsWith('/api/hr/sites') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  const response = await saved;
  expect(response.status()).toBe(201);
  const site = (await response.json()).data as Entity;
  resources.add(`site ${site.id}`, () => api.deleteData(`/hr/sites/${site.id}`));
  await expect(page).toHaveURL(/\/hr\/sites$/);
  await page.getByLabel('Search', { exact: true }).fill(payload.siteCode);
  const row = page.getByRole('row').filter({ hasText: payload.siteCode });
  await expect(row).toHaveCount(1);
  await expect(row.getByRole('button', { name: /edit|view/i })).toHaveCount(0);
  await row.getByText(payload.siteCode, { exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/hr/sites/${site.id}/view$`));
  await expect(page.getByLabel('Site Name', { exact: false })).toBeDisabled();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/hr/sites/${site.id}/edit$`));
  await page.getByLabel('Site Name', { exact: false }).fill(`${runId} Updated`);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/hr\/sites$/);
  expect((await api.getData<Entity>(`/hr/sites/${site.id}`)).siteName).toBe(`${runId} Updated`);
});

test('@ui @security @regression viewer has read-only view and direct edit navigation is denied', async ({ browser, api, resources, runId }) => {
  const site = await api.postData<Entity>('/hr/sites', siteData(runId), 201);
  resources.add(`site ${site.id}`, () => api.deleteData(`/hr/sites/${site.id}`));
  const viewer = await createAccount(api, resources, runId, site.id, ['SITE_VIEW']);
  const response = await viewer.context.post('auth/login', { data: { username: viewer.username, password: viewer.password } });
  const access = (await response.json()).data;
  const context = await browser.newContext({ baseURL: env.uiBaseUrl, storageState: {
    cookies: [], origins: [{ origin: new URL(env.uiBaseUrl).origin, localStorage: [
      { name: 'token', value: access.token },
      ...['user', 'roles', 'permissions', 'allowedSites'].map((name) => ({ name, value: JSON.stringify(access[name]) })),
    ] }],
  } });
  try {
    const page = await context.newPage();
    await page.goto(`/hr/sites/${site.id}/view`);
    await expect(page.getByLabel('Site Code', { exact: false })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
    await page.goto(`/hr/sites/${site.id}/edit`);
    await expect(page.getByText('Access Denied', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
  } finally { await context.close(); }
});
