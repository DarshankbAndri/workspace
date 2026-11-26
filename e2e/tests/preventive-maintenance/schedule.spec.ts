import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData } from '../../fixtures/core-data.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@regression PM generation advances successive due dates and rejects invalid frequency', async ({ api, resources, runId }) => {
  const master = await createMasterData(api, resources, runId);
  const payload = {
    siteId: master.site.id, equipmentId: master.equipment.id, vendorId: master.vendor.id,
    title: `${runId} PM`, description: 'Quarterly E2E inspection', frequency: 'MONTHLY', priority: 'MEDIUM',
    assignedTo: 'VENDOR', startDate: '2026-09-01', endDate: '2027-09-01', active: true,
  };
  const schedule = await api.postData<Record<string, unknown>>('/preventive-maintenance/schedules', payload, 201);
  resources.add(`PM schedule ${schedule.id}`, () => api.deleteData(`/preventive-maintenance/schedules/${schedule.id}`));
  expect(schedule.nextDueDate).toBeTruthy();
  expect((await api.getData<Record<string, unknown>>(`/preventive-maintenance/schedules/${schedule.id}`)).title).toBe(payload.title);
  const first = await api.postData<Record<string, unknown>>(`/preventive-maintenance/schedules/${schedule.id}/generate-work-order`);
  expect(first.lastGeneratedDate).toBe(schedule.nextDueDate);
  expect(String(first.nextDueDate) > String(schedule.nextDueDate)).toBe(true);
  const second = await api.postData<Record<string, unknown>>(`/preventive-maintenance/schedules/${schedule.id}/generate-work-order`);
  expect(second.lastGeneratedDate).toBe(first.nextDueDate);
  expect(String(second.nextDueDate) > String(first.nextDueDate)).toBe(true);
  const persisted = await api.getData<Record<string, unknown>>(`/preventive-maintenance/schedules/${schedule.id}`);
  expect(persisted.nextDueDate).toBe(second.nextDueDate);
  await expectApiError(await api.post('/preventive-maintenance/schedules', { ...payload, frequency: 'HOURLY' }), 400);
});
