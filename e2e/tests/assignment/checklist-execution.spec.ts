import fs from 'node:fs';
import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMaintenanceData, type Entity } from '../../fixtures/core-data.js';
import { assignmentData } from '../../data/factories.js';
import { expectApiError, expectSuccess } from '../../helpers/api-envelope.js';

test('@workflow @regression required checklist and proof gate assignment completion', async ({ api, resources, runId }) => {
  const data = await createMaintenanceData(api, resources, runId);
  const payload = assignmentData(runId, data.site.id, data.request.id, data.vendor.id, data.employee.id);
  await api.putData(`/maintenance/assignments/${data.assignment.id}`, { ...payload, status: 'IN_PROGRESS', actualStartDate: '2026-09-07' });
  const log = await api.postData<Entity>(`/maintenance/assignments/${data.assignment.id}/work-logs`, {
    technicianEmployeeId: data.employee.id, startTime: '2026-09-07T06:30:00Z', endTime: '2026-09-07T07:30:00Z',
    workNotes: runId, actionTaken: 'Inspection', completionStatus: 'COMPLETED',
  }, 201);
  resources.add(`log ${log.id}`, () => api.deleteData(`/maintenance/assignments/${data.assignment.id}/work-logs/${log.id}`));
  const stepPayload = { sequenceNumber: 1, taskTitle: `${runId} Safety check`, required: true, proofRequired: true, responseType: 'PHOTO' };
  const step = await api.postData<Entity>(`/maintenance/assignments/${data.assignment.id}/checklist`, stepPayload, 201);
  resources.add(`step ${step.id}`, () => api.deleteData(`/maintenance/assignments/${data.assignment.id}/checklist/${step.id}`));
  const complete = { ...payload, status: 'COMPLETED', actualStartDate: '2026-09-07', actualEndDate: '2026-09-07' };
  const missingStep = await expectApiError(await api.put(`/maintenance/assignments/${data.assignment.id}`, complete), 400);
  expect(missingStep.message).toMatch(/checklist/i);
  await expectApiError(await api.put(`/maintenance/assignments/${data.assignment.id}/checklist/${step.id}`, {
    ...stepPayload, status: 'INVALID',
  }), 400);
  await api.putData(`/maintenance/assignments/${data.assignment.id}/checklist/${step.id}`, { ...stepPayload, status: 'COMPLETED' });
  const missingProof = await expectApiError(await api.put(`/maintenance/assignments/${data.assignment.id}`, complete), 400);
  expect(missingProof.message).toMatch(/proof/i);
  const file = fs.readFileSync('fixtures/files/sample.pdf');
  const proof = await expectSuccess<Entity>(await api.request.post(
    `maintenance/assignments/${data.assignment.id}/checklist/${step.id}/proof`,
    { multipart: { file: { name: 'inspection.pdf', mimeType: 'application/pdf', buffer: file } } },
  ));
  resources.add(`proof ${proof.id}`, () => api.deleteData(`/maintenance/assignments/${data.assignment.id}/checklist/${step.id}/proof/${proof.id}`));
  const downloaded = await api.get(`/maintenance/assignments/${data.assignment.id}/checklist/${step.id}/proof/${proof.id}`);
  expect(downloaded.status()).toBe(200);
  expect(await downloaded.body()).toEqual(file);
  const persisted = await api.getData<Entity[]>(`/maintenance/assignments/${data.assignment.id}/checklist`);
  expect(persisted.find((item) => item.id === step.id)?.status).toBe('COMPLETED');
  await api.putData(`/maintenance/assignments/${data.assignment.id}`, complete);
  expect((await api.getData<Entity>(`/maintenance/requests/${data.request.id}`)).status).toBe('COMPLETED');
});

test('@security @regression checklist IDs cannot be addressed through another assignment', async ({ api, resources, runId }) => {
  const a = await createMaintenanceData(api, resources, `${runId}-A`);
  const b = await createMaintenanceData(api, resources, `${runId}-B`);
  const payload = { taskTitle: `${runId} Owned step`, required: false, responseType: 'TEXT' };
  const step = await api.postData<Entity>(`/maintenance/assignments/${a.assignment.id}/checklist`, payload, 201);
  resources.add(`step ${step.id}`, () => api.deleteData(`/maintenance/assignments/${a.assignment.id}/checklist/${step.id}`));
  await expectApiError(await api.put(`/maintenance/assignments/${b.assignment.id}/checklist/${step.id}`, {
    ...payload, status: 'COMPLETED',
  }), 404);
  await expectApiError(await api.delete(`/maintenance/assignments/${b.assignment.id}/checklist/${step.id}`), 404);
  expect((await api.getData<Entity[]>(`/maintenance/assignments/${a.assignment.id}/checklist`))
    .find((item) => item.id === step.id)?.status).toBe('PENDING');
});
