import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData } from '../../fixtures/core-data.js';
import { equipmentData, requestData, siteData } from '../../data/factories.js';
import { expectApiError } from '../../helpers/api-envelope.js';

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

test('@security @site-isolation scoped user cannot list or address another site', async ({ api, resources, runId }) => {
  test.skip(!process.env.CMMS_SITE_A_USERNAME || !process.env.CMMS_SITE_A_PASSWORD,
    'Requires a non-admin SITE-A account via CMMS_SITE_A_USERNAME/CMMS_SITE_A_PASSWORD.');
  const masterB = await createMasterData(api, resources, `${runId}-B`);
  const { authenticatedContext } = await import('../../helpers/auth.js');
  const context = await authenticatedContext(process.env.CMMS_SITE_A_USERNAME!, process.env.CMMS_SITE_A_PASSWORD!);
  for (const target of [`/equipment/${masterB.equipment.id}`, `/hr/employees/${masterB.employee.id}`, `/vendors/${masterB.vendor.id}`]) {
    expect([403, 404]).toContain((await context.get(target.replace(/^\/+/, ''))).status());
  }
  expect([403, 404]).toContain((await context.delete(`equipment/${masterB.equipment.id}`)).status());
  await context.dispose();
});
