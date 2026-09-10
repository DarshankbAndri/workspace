import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData } from '../../fixtures/core-data.js';
import { uniqueCode } from '../../helpers/run-id.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@regression vendor AMC mapping, date validation and renewal history', async ({ api, resources, runId }) => {
  const master = await createMasterData(api, resources, runId);
  const payload = { siteId: master.site.id, vendorId: master.vendor.id, contractNumber: uniqueCode(runId, 'AMC'),
    contractName: `${runId} AMC`, contractType: 'COMPREHENSIVE', startDate: '2026-09-01', endDate: '2027-08-31',
    contractValue: 10000, includesLabor: true, includesSpares: true, status: 'ACTIVE' };
  const contract = await api.postData<Record<string, unknown>>('/vendor-amc', payload, 201);
  resources.add(`AMC ${contract.id}`, () => api.deleteData(`/vendor-amc/${contract.id}`));
  const mapping = await api.postData<Record<string, unknown>>(`/vendor-amc/${contract.id}/equipment`, {
    equipmentId: master.equipment.id, coverageType: 'FULL', coverageStartDate: payload.startDate,
    coverageEndDate: payload.endDate, active: true, remarks: runId,
  }, 201);
  expect(mapping.equipmentId).toBe(master.equipment.id);
  resources.add(`AMC equipment ${master.equipment.id}`, () => api.deleteData(`/vendor-amc/${contract.id}/equipment/${master.equipment.id}`));
  expect((await api.getData<Array<unknown>>(`/vendor-amc/${contract.id}/equipment`)).length).toBe(1);
  await expectApiError(await api.post('/vendor-amc', { ...payload, contractNumber: uniqueCode(runId, 'BAD'),
    startDate: '2027-01-01', endDate: '2026-01-01' }), 400);
});
