import { test, expect } from '../../fixtures/cmms.fixture.js';
import { authenticatedContext } from '../../helpers/auth.js';

test('@security @rbac viewer cannot perform administrative writes', async () => {
  test.skip(!process.env.CMMS_VIEWER_USERNAME || !process.env.CMMS_VIEWER_PASSWORD,
    'Requires CMMS_VIEWER_USERNAME and CMMS_VIEWER_PASSWORD.');
  const viewer = await authenticatedContext(process.env.CMMS_VIEWER_USERNAME!, process.env.CMMS_VIEWER_PASSWORD!);
  for (const target of ['/hr/sites', '/equipment', '/admin/roles', '/approval-configs']) {
    expect((await viewer.post(target.replace(/^\/+/, ''), { data: {} })).status()).toBe(403);
  }
  await viewer.dispose();
});

test('@security @rbac authenticated admin has effective permission metadata', async ({ api }) => {
  const me = await api.getData<Record<string, unknown>>('/auth/me');
  expect(Array.isArray(me.roles)).toBeTruthy();
  expect(Array.isArray(me.permissions)).toBeTruthy();
  expect((me.roles as unknown[]).length).toBeGreaterThan(0);
});
