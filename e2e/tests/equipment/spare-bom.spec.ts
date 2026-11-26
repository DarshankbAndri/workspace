import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData, createSpare, type Entity } from '../../fixtures/core-data.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@api @regression equipment BOM persists updates and rejects duplicate, invalid and cross-site links', async ({ api, resources, runId }) => {
  const data = await createMasterData(api, resources, runId);
  const spare = await createSpare(api, resources, runId, data.site.id, data.vendor.id);
  const payload = { stockId: spare.stockId, recommendedQty: 2, criticality: 'MEDIUM', status: 'ACTIVE' };
  const bom = await api.postData<Entity & { bomId: number }>(`/equipment/${data.equipment.id}/spare-bom`, payload, 201);
  let deleted = false;
  resources.add(`BOM ${bom.bomId}`, async () => {
    if (!deleted) await api.deleteData(`/equipment/${data.equipment.id}/spare-bom/${bom.bomId}`);
  });
  await expectApiError(await api.post(`/equipment/${data.equipment.id}/spare-bom`, payload), 400);
  await expectApiError(await api.put(`/equipment/${data.equipment.id}/spare-bom/${bom.bomId}`, {
    ...payload, recommendedQty: -1,
  }), 400);
  await api.putData(`/equipment/${data.equipment.id}/spare-bom/${bom.bomId}`, { ...payload, recommendedQty: 3 });
  const persisted = await api.getData<Array<Entity>>(`/equipment/${data.equipment.id}/spare-bom`);
  expect(persisted.find((item) => item.bomId === bom.bomId)?.recommendedQty).toBe(3);
  const other = await createMasterData(api, resources, `${runId}-B`);
  await expectApiError(await api.post(`/equipment/${other.equipment.id}/spare-bom`, payload), 400);
  await api.deleteData(`/equipment/${data.equipment.id}/spare-bom/${bom.bomId}`);
  deleted = true;
  expect(await api.getData(`/equipment/${data.equipment.id}/spare-bom`)).toEqual([]);
});
