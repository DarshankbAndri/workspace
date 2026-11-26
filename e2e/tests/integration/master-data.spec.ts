import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData } from '../../fixtures/core-data.js';
import { searchPage } from '../../data/factories.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@regression @api master data persists and remains relationally consistent', async ({ api, resources, runId }) => {
  const data = await createMasterData(api, resources, runId);
  const equipment = await api.getData<{ siteId: number; equipmentCode: string }>(`/equipment/${data.equipment.id}`);
  expect(equipment.siteId).toBe(data.site.id);
  const page = await api.search<{ data: Array<{ id: number }>; totalRecords: number }>('/equipment/search', {
    ...searchPage(0, 10, 'equipmentCode', 'ASC'),
    searchCriteriaList: [{ filterKey: 'siteId', dataType: 'LONG', value: data.site.id, operation: 'equal' }],
  });
  expect(page.data.map((row) => row.id)).toContain(data.equipment.id);
  await expectApiError(await api.post('/equipment', { equipmentCode: 'BAD', equipmentName: 'Bad', siteId: -1, category: 'PUMP' }), 404);
});
