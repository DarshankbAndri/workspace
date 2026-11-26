import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData } from '../../fixtures/core-data.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@regression @workflow downtime lifecycle calculates duration and history', async ({ api, resources, runId }) => {
  const master = await createMasterData(api, resources, runId);
  const downtime = await api.postData<Record<string, unknown>>('/maintenance/downtime', {
    equipmentId: master.equipment.id, siteId: master.site.id, downtimeStart: '2026-09-07T06:00:00Z',
    reason: `${runId} bearing failure`, reasonCategory: 'MECHANICAL', planned: false,
  }, 201);
  resources.add(`downtime ${downtime.id}`, () => api.deleteData(`/maintenance/downtime/${downtime.id}`));
  expect((await api.postData<Record<string, unknown>>(`/maintenance/downtime/${downtime.id}/confirm`, { comment: runId })).status).toBe('CONFIRMED');
  expect((await api.postData<Record<string, unknown>>(`/maintenance/downtime/${downtime.id}/start-maintenance`, { comment: runId })).status).toBe('UNDER_MAINTENANCE');
  expect((await api.postData<Record<string, unknown>>(`/maintenance/downtime/${downtime.id}/restore`, {
    downtimeEnd: '2026-09-07T08:00:00Z', rootCause: 'Worn bearing', comment: runId,
  })).status).toBe('RESTORED');
  const verified = await api.postData<Record<string, unknown>>(`/maintenance/downtime/${downtime.id}/verify`, { comment: runId });
  expect(verified.status).toBe('VERIFIED');
  expect(Number(verified.downtimeMinutes)).toBe(120);
  const rca = await api.postData<Record<string, unknown>>(`/maintenance/downtime/${downtime.id}/rca-actions`, {
    actionType: 'CORRECTIVE', description: `${runId} replace bearing`, responsibleEmployeeId: master.employee.id,
    targetDate: '2026-09-10', status: 'OPEN',
  }, 201);
  expect(rca.id).toBeTruthy();
  expect((await api.postData<Record<string, unknown>>(`/maintenance/downtime/${downtime.id}/close`, { closureRemarks: runId })).status).toBe('CLOSED');
  const timeline = await api.getData<Array<Record<string, unknown>>>(`/maintenance/downtime/${downtime.id}/timeline`);
  expect(timeline.length).toBeGreaterThanOrEqual(5);
  await expectApiError(await api.post(`/maintenance/downtime/${downtime.id}/confirm`, {}), 400);
});
