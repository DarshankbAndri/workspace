import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createAccount } from '../../fixtures/accounts.js';
import { siteData } from '../../data/factories.js';
import { expectApiError } from '../../helpers/api-envelope.js';
import type { Entity } from '../../fixtures/core-data.js';

test('@security @rbac @regression viewer can read but cannot perform administrative writes', async ({ api, resources, runId }) => {
  const site = await api.postData<Entity>('/hr/sites', siteData(runId), 201);
  resources.add(`site ${site.id}`, () => api.deleteData(`/hr/sites/${site.id}`));
  const viewer = await createAccount(api, resources, runId, site.id, ['SITE_VIEW', 'EQUIPMENT_VIEW']);
  await viewer.api.getData(`/hr/sites/${site.id}`);
  await viewer.api.getData(`/equipment?siteId=${site.id}`);
  for (const target of ['/hr/sites', '/equipment', '/admin/roles', '/admin/approval-config']) {
    await expectApiError(await viewer.api.post(target, {}), 403);
  }
  await expectApiError(await viewer.api.put(`/hr/sites/${site.id}`, siteData(runId)), 403);
  await expectApiError(await viewer.api.delete(`/hr/sites/${site.id}`), 403);
  await expectApiError(await viewer.api.get('/not-a-mapped-api'), 403);
});

test('@security @rbac authenticated admin has effective permission metadata', async ({ api }) => {
  const me = await api.getData<Record<string, unknown>>('/auth/me');
  expect(Array.isArray(me.roles)).toBeTruthy();
  expect(Array.isArray(me.permissions)).toBeTruthy();
  expect((me.roles as unknown[]).length).toBeGreaterThan(0);
});
