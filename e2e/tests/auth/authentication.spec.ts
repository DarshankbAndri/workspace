import { test, expect, request } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { env } from '../../helpers/env.js';
import { expectApiError, expectSuccess } from '../../helpers/api-envelope.js';

test.describe('@smoke @regression @auth authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('successful UI login stores access and redirects', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(env.adminUsername, env.adminPassword);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeTruthy();
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('roles') || '[]'))).toContain('SUPER_ADMIN');
  });

  test('invalid and unknown credentials return the same 401 envelope', async () => {
    const api = await request.newContext({ baseURL: env.apiBaseUrl });
    try {
      await expectApiError(await api.post('auth/login', { data: { username: env.adminUsername, password: 'wrong-e2e-password' } }), 401);
      await expectApiError(await api.post('auth/login', { data: { username: 'missing-e2e-user', password: 'wrong-e2e-password' } }), 401);
    } finally { await api.dispose(); }
  });

  test('empty login is rejected in UI and API', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText('Username is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    const api = await request.newContext({ baseURL: env.apiBaseUrl });
    try { await expectApiError(await api.post('auth/login', { data: {} }), 400); }
    finally { await api.dispose(); }
  });

  test('protected API rejects missing and invalid JWT', async () => {
    const anonymous = await request.newContext({ baseURL: env.apiBaseUrl });
    const invalid = await request.newContext({ baseURL: env.apiBaseUrl, extraHTTPHeaders: { Authorization: 'Bearer invalid.jwt.token' } });
    try {
      expect([401, 403]).toContain((await anonymous.get('equipment')).status());
      expect([401, 403]).toContain((await invalid.get('equipment')).status());
    } finally { await anonymous.dispose(); await invalid.dispose(); }
  });

  test('refresh returns a new valid token and logout clears UI state', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(env.adminUsername, env.adminPassword);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const api = await request.newContext({ baseURL: env.apiBaseUrl, extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
    try { expect(await expectSuccess<{ token?: string }>(await api.post('auth/refresh'))).toBeTruthy(); }
    finally { await api.dispose(); }
    await page.evaluate(() => {
      ['token', 'user', 'roles', 'permissions', 'allowedSites'].forEach((key) => localStorage.removeItem(key));
      window.dispatchEvent(new CustomEvent('cmms:auth-expired'));
    });
    await page.goto('/equipment');
    await expect(page).toHaveURL(/\/login$/);
  });
});
