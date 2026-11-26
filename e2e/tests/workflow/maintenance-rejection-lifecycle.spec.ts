import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData } from '../../fixtures/core-data.js';
import { requestData, assignmentData } from '../../data/factories.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@workflow @regression invalid and cancelled request workflows are blocked', async ({ api, resources, runId }) => {
  const master = await createMasterData(api, resources, runId);
  const request = await api.postData<Record<string, unknown>>('/maintenance/requests', requestData(runId, master.site.id, master.equipment.id), 201);
  resources.add(`request ${request.id}`, () => api.deleteData(`/maintenance/requests/${request.id}`));
  await expectApiError(await api.post(`/maintenance/requests/${request.id}/transition`, { action: 'NOT_A_TRANSITION', reason: runId }), 400);
  expect((await api.getData<Record<string, unknown>>(`/maintenance/requests/${request.id}`)).status).toBe('OPEN');
  const cancelled = await api.postData<Record<string, unknown>>(`/maintenance/requests/${request.id}/transition`, { action: 'CANCEL', reason: `${runId} cancelled` });
  expect(cancelled.status).toBe('CANCELLED');
  await expectApiError(await api.post('/maintenance/assignments', assignmentData(
    runId, master.site.id, Number(request.id), master.vendor.id, master.employee.id,
  )), 400);
});
