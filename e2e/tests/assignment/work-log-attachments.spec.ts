import fs from 'node:fs';
import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMaintenanceData, type Entity } from '../../fixtures/core-data.js';
import { expectApiError, expectSuccess } from '../../helpers/api-envelope.js';

test('@workflow @regression work logs validate time, persist edits and protect attachment ownership', async ({ api, resources, runId }) => {
  const a = await createMaintenanceData(api, resources, `${runId}-A`);
  const b = await createMaintenanceData(api, resources, `${runId}-B`);
  const payload = { technicianEmployeeId: a.employee.id, startTime: '2026-09-07T06:00:00Z',
    endTime: '2026-09-07T07:00:00Z', workNotes: runId, actionTaken: 'Inspection', completionStatus: 'COMPLETED' };
  await expectApiError(await api.post(`/maintenance/assignments/${a.assignment.id}/work-logs`, {
    ...payload, endTime: '2026-09-07T05:00:00Z',
  }), 400);
  const log = await api.postData<Entity>(`/maintenance/assignments/${a.assignment.id}/work-logs`, payload, 201);
  let deleted = false;
  resources.add(`work log ${log.id}`, async () => {
    if (!deleted) await api.deleteData(`/maintenance/assignments/${a.assignment.id}/work-logs/${log.id}`);
  });
  await api.putData(`/maintenance/assignments/${a.assignment.id}/work-logs/${log.id}`, { ...payload, actionTaken: 'Seal replaced' });
  const logs = await api.getData<Entity[]>(`/maintenance/assignments/${a.assignment.id}/work-logs`);
  expect(logs.find((item) => item.id === log.id)?.actionTaken).toBe('Seal replaced');
  await expectApiError(await api.put(`/maintenance/assignments/${b.assignment.id}/work-logs/${log.id}`, payload), 404);
  const bytes = fs.readFileSync('fixtures/files/sample.pdf');
  const attachment = await expectSuccess<Entity>(await api.request.post(
    `maintenance/assignments/${a.assignment.id}/work-logs/${log.id}/attachments`,
    { multipart: { file: { name: 'repair.pdf', mimeType: 'application/pdf', buffer: bytes } } },
  ), 201);
  const download = await api.get(`/maintenance/assignments/${a.assignment.id}/work-logs/${log.id}/attachments/${attachment.id}`);
  expect(download.status()).toBe(200);
  expect(await download.body()).toEqual(bytes);
  await expectApiError(await api.get(`/maintenance/assignments/${b.assignment.id}/work-logs/${log.id}/attachments/${attachment.id}`), 404);
  await api.deleteData(`/maintenance/assignments/${a.assignment.id}/work-logs/${log.id}/attachments/${attachment.id}`);
  await expectApiError(await api.get(`/maintenance/assignments/${a.assignment.id}/work-logs/${log.id}/attachments/${attachment.id}`), 404);
  await api.deleteData(`/maintenance/assignments/${a.assignment.id}/work-logs/${log.id}`);
  deleted = true;
  expect(await api.getData(`/maintenance/assignments/${a.assignment.id}/work-logs`)).toEqual([]);
});
