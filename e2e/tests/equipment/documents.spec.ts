import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData } from '../../fixtures/core-data.js';
import { expectSuccess, expectApiError } from '../../helpers/api-envelope.js';

test('@regression equipment document upload, metadata, download and delete', async ({ api, resources, runId }) => {
  const master = await createMasterData(api, resources, runId);
  const file = fs.readFileSync(path.resolve('fixtures/files/sample.pdf'));
  const upload = await api.request.post(`equipment/${master.equipment.id}/documents`, { multipart: {
    file: { name: `${runId}.pdf`, mimeType: 'application/pdf', buffer: file }, documentType: 'MANUAL', remarks: runId,
  } });
  const document = await expectSuccess<Record<string, unknown>>(upload, 201);
  resources.add(`document ${document.documentId}`, () => api.deleteData(`/equipment/${master.equipment.id}/documents/${document.documentId}`));
  const metadata = await api.getData<Array<Record<string, unknown>>>(`/equipment/${master.equipment.id}/documents`);
  expect(metadata.some((item) => item.documentId === document.documentId)).toBeTruthy();
  const download = await api.get(`/equipment/${master.equipment.id}/documents/${document.documentId}/file`);
  expect(download.status()).toBe(200);
  expect((await download.body()).length).toBeGreaterThan(0);
  await expectApiError(await api.request.post(`equipment/${master.equipment.id}/documents`, { multipart: {
    file: { name: 'invalid.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('invalid') }, documentType: 'OTHER',
  } }), 400);
});
