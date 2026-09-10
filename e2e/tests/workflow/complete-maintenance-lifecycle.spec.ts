import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMaintenanceData } from '../../fixtures/core-data.js';
import { assignmentData } from '../../data/factories.js';

test('@workflow @regression complete maintenance lifecycle preserves related state', async ({ api, resources, runId }) => {
  const data = await createMaintenanceData(api, resources, runId);
  expect((await api.getData<Record<string, unknown>>(`/maintenance/requests/${data.request.id}`)).status).toBe('ASSIGNED');
  const payload = assignmentData(runId, data.site.id, data.request.id, data.vendor.id, data.employee.id);
  expect((await api.putData<Record<string, unknown>>(`/maintenance/assignments/${data.assignment.id}`, {
    ...payload, status: 'IN_PROGRESS', actualStartDate: '2026-09-07',
  })).status).toBe('IN_PROGRESS');

  const log = await api.postData<Record<string, unknown>>(`/maintenance/assignments/${data.assignment.id}/work-logs`, {
    technicianEmployeeId: data.employee.id, startTime: '2026-09-07T06:30:00Z', endTime: '2026-09-07T07:30:00Z',
    workNotes: `${runId} verified pump`, actionTaken: 'Inspection and repair', completionStatus: 'COMPLETED',
  }, 201);
  resources.add(`work log ${log.id}`, () => api.deleteData(`/maintenance/assignments/${data.assignment.id}/work-logs/${log.id}`));
  const logs = await api.getData<Array<Record<string, unknown>>>(`/maintenance/assignments/${data.assignment.id}/work-logs`);
  expect(logs.some((item) => item.id === log.id && item.completionStatus === 'COMPLETED')).toBeTruthy();

  expect((await api.putData<Record<string, unknown>>(`/maintenance/assignments/${data.assignment.id}`, {
    ...payload, status: 'COMPLETED', actualStartDate: '2026-09-07', actualEndDate: '2026-09-07', actualCost: 25,
  })).status).toBe('COMPLETED');
  expect((await api.getData<Record<string, unknown>>(`/maintenance/requests/${data.request.id}`)).status).toBe('COMPLETED');
  expect(JSON.stringify(await api.getData(`/maintenance/requests/${data.request.id}/related-records`))).toContain(String(data.assignment.id));
});
