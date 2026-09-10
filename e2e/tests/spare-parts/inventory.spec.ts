import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData, createSpare } from '../../fixtures/core-data.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@regression @workflow stock receipt and adjustment preserve transaction ledger', async ({ api, resources, runId }) => {
  const master = await createMasterData(api, resources, runId);
  const spare = await createSpare(api, resources, runId, master.site.id, master.vendor.id);
  const before = Number(spare.currentStock);
  const received = await api.postData<Record<string, unknown>>(`/spare-parts/${spare.stockId}/stock-in`, {
    quantity: 10, unitCost: 12, remarks: runId, transactionDate: '2026-09-07T06:00:00Z',
  });
  expect(Number(received.stockAfter)).toBe(before + 10);
  const adjusted = await api.postData<Record<string, unknown>>(`/spare-parts/${spare.stockId}/adjust`, {
    quantity: before + 5, remarks: runId, transactionDate: '2026-09-07T07:00:00Z',
  });
  expect(Number(adjusted.stockAfter)).toBe(before + 5);
  const ledger = await api.getData<Array<Record<string, unknown>>>(`/spare-parts/${spare.stockId}/transactions`);
  expect(ledger.length).toBeGreaterThanOrEqual(2);
  await expectApiError(await api.post(`/spare-parts/${spare.stockId}/stock-in`, { quantity: -1 }), 400);
});
