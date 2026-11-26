import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData } from '../../fixtures/core-data.js';
import { equipmentData, requestData, siteData } from '../../data/factories.js';
import { expectApiError } from '../../helpers/api-envelope.js';
import { createAccount } from '../../fixtures/accounts.js';
import { searchPage } from '../../data/factories.js';
import type { Entity } from '../../fixtures/core-data.js';
import type { SearchPage } from '../../api/cmms-api-client.js';

test('@security @site-isolation cross-site foreign keys cannot be combined', async ({ api, resources, runId }) => {
  const siteA = await api.postData<Record<string, number>>('/hr/sites', siteData(runId, 'SITE-A'), 201);
  resources.add(`site A ${siteA.id}`, () => api.deleteData(`/hr/sites/${siteA.id}`));
  const siteB = await api.postData<Record<string, number>>('/hr/sites', siteData(runId, 'SITE-B'), 201);
  resources.add(`site B ${siteB.id}`, () => api.deleteData(`/hr/sites/${siteB.id}`));
  const equipmentB = await api.postData<Record<string, number>>('/equipment', equipmentData(runId, siteB.id, undefined, 'EQ-B'), 201);
  resources.add(`equipment B ${equipmentB.id}`, () => api.deleteData(`/equipment/${equipmentB.id}`));
  const response = await api.post('/maintenance/requests', requestData(runId, siteA.id, equipmentB.id, 'CROSS-SITE'));
  expect([400, 403]).toContain(response.status());
  await expectApiError(response, response.status());
});

test('@security @site-isolation @regression scoped user cannot list or address another site', async ({ api, resources, runId }) => {
  const masterA = await createMasterData(api, resources, `${runId}-A`);
  const masterB = await createMasterData(api, resources, `${runId}-B`);
  const scoped = await createAccount(api, resources, runId, masterA.site.id,
    ['EQUIPMENT_VIEW', 'EQUIPMENT_DELETE', 'EMPLOYEE_VIEW', 'VENDOR_VIEW']);
  expect((await scoped.api.getData<Entity>(`/equipment/${masterA.equipment.id}`)).id).toBe(masterA.equipment.id);
  for (const target of [`/equipment/${masterB.equipment.id}`, `/hr/employees/${masterB.employee.id}`, `/vendors/${masterB.vendor.id}`]) {
    await expectApiError(await scoped.api.get(target), 403);
  }
  await expectApiError(await scoped.api.delete(`/equipment/${masterB.equipment.id}`), 403);
  const listed = await scoped.api.getData<Entity[]>('/equipment');
  expect(listed.map((item) => item.id)).toContain(masterA.equipment.id);
  expect(listed.every((item) => item.siteId === masterA.site.id)).toBe(true);
  const searched = await scoped.api.search<SearchPage<Entity>>('/equipment/search', searchPage());
  expect(searched.data.map((item) => item.id)).toContain(masterA.equipment.id);
  expect(searched.data.every((item) => item.siteId === masterA.site.id)).toBe(true);
  await expectApiError(await scoped.api.post('/equipment/search', {
    ...searchPage(), dataOption: 'any',
    searchCriteriaList: [{ filterKey: 'siteId', dataType: 'NUMBER', operation: 'eq', value: masterB.site.id }],
  }), 403);
  expect((await api.getData<Entity>(`/equipment/${masterB.equipment.id}`)).id).toBe(masterB.equipment.id);
});
