import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMaintenanceData, createSpare, type Entity } from '../../fixtures/core-data.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@workflow @regression spare approval, reservation, issue, consumption and return reconcile stock', async ({ api, resources, runId }) => {
  const data = await createMaintenanceData(api, resources, runId);
  const spare = await createSpare(api, resources, runId, data.site.id, data.vendor.id);
  const payload = { stockId: spare.stockId, quantityUsed: 10, remarks: runId };
  const usage = await api.postData<Entity>(`/assignments/${data.assignment.id}/spare-requests`, payload, 201);
  // Issued/consumed lines are audit history and have no deletion API; the isolated DB retains them.
  await expectApiError(await api.post(`/assignments/${data.assignment.id}/spare-requests`, payload), 400);
  await expectApiError(await api.post(`/spare-requests/${usage.id}/issue`, {}), 400);
  await expectApiError(await api.post(`/spare-requests/${usage.id}/manager-approve`, { approvedQty: 11 }), 400);
  expect((await api.postData<Entity>(`/spare-requests/${usage.id}/manager-approve`, { approvedQty: 10 })).status).toBe('MANAGER_APPROVED');
  expect((await api.postData<Entity>(`/spare-requests/${usage.id}/check-stock`, {})).status).toBe('STOCK_AVAILABLE');
  expect((await api.postData<Entity>(`/spare-requests/${usage.id}/reserve`, {})).status).toBe('RESERVED');
  const reserved = await api.getData<Entity>(`/spare-parts/${spare.stockId}`);
  expect(Number(reserved.reservedStock)).toBe(10);
  expect(Number(reserved.availableStock)).toBe(90);
  await expectApiError(await api.post(`/spare-requests/${usage.id}/reserve`, {}), 400);
  expect((await api.postData<Entity>(`/spare-requests/${usage.id}/issue`, {})).status).toBe('ISSUED');
  await expectApiError(await api.post(`/spare-requests/${usage.id}/consume-return`, { consumedQty: 11, returnedQty: 0 }), 400);
  expect((await api.postData<Entity>(`/spare-requests/${usage.id}/consume-return`, { consumedQty: 5, returnedQty: 0 })).status).toBe('PARTIALLY_CONSUMED');
  expect((await api.postData<Entity>(`/spare-requests/${usage.id}/consume-return`, { consumedQty: 7, returnedQty: 3 })).status).toBe('RETURNED');
  const stock = await api.getData<Entity>(`/spare-parts/${spare.stockId}`);
  expect(Number(stock.currentStock)).toBe(93);
  expect(Number(stock.reservedStock)).toBe(0);
  const persisted = await api.getData<Entity>(`/spare-requests/${usage.id}`);
  expect(Number(persisted.totalCost)).toBe(70);
  await expectApiError(await api.post(`/spare-requests/${usage.id}/consume-return`, { consumedQty: 7, returnedQty: 3 }), 400);
  expect(Number((await api.getData<Entity>(`/spare-parts/${spare.stockId}`)).currentStock)).toBe(93);
});

test('@workflow @regression cancelled reservations release stock and rejected requests cannot be issued', async ({ api, resources, runId }) => {
  const data = await createMaintenanceData(api, resources, runId);
  const spare = await createSpare(api, resources, runId, data.site.id, data.vendor.id);
  const usage = await api.postData<Entity>(`/maintenance/assignments/${data.assignment.id}/spares`, { stockId: spare.stockId, quantityUsed: 5 }, 201);
  resources.add(`usage ${usage.id}`, () => api.deleteData(`/maintenance/assignments/${data.assignment.id}/spares/${usage.id}`));
  await api.postData(`/spare-requests/${usage.id}/manager-approve`, {});
  await api.postData(`/spare-requests/${usage.id}/check-stock`, {});
  await api.postData(`/spare-requests/${usage.id}/reserve`, {});
  await api.postData(`/maintenance/assignments/${data.assignment.id}/spares/${usage.id}/cancel`, {});
  const stock = await api.getData<Entity>(`/spare-parts/${spare.stockId}`);
  expect(Number(stock.currentStock)).toBe(100);
  expect(Number(stock.reservedStock)).toBe(0);
  await expectApiError(await api.post(`/spare-requests/${usage.id}/issue`, {}), 400);
  const another = await createSpare(api, resources, `${runId}-B`, data.site.id, data.vendor.id);
  const rejected = await api.postData<Entity>(`/assignments/${data.assignment.id}/spare-requests`, { stockId: another.stockId, quantityUsed: 2 }, 201);
  resources.add(`usage ${rejected.id}`, () => api.deleteData(`/maintenance/assignments/${data.assignment.id}/spares/${rejected.id}`));
  expect((await api.postData<Entity>(`/spare-requests/${rejected.id}/manager-reject`, { remarks: 'Not needed' })).status).toBe('MANAGER_REJECTED');
  await expectApiError(await api.post(`/spare-requests/${rejected.id}/manager-approve`, {}), 400);
});

test('@workflow @regression stock shortage creates a linked purchase request and receipt replenishes inventory', async ({ api, resources, runId }) => {
  const data = await createMaintenanceData(api, resources, runId);
  const spare = await createSpare(api, resources, runId, data.site.id, data.vendor.id);
  const usage = await api.postData<Entity>(`/assignments/${data.assignment.id}/spare-requests`, { stockId: spare.stockId, quantityUsed: 120 }, 201);
  await api.postData(`/spare-requests/${usage.id}/manager-approve`, {});
  expect((await api.postData<Entity>(`/spare-requests/${usage.id}/check-stock`, {})).status).toBe('STOCK_NOT_AVAILABLE');
  const reorder = await api.postData<Entity>(`/spare-requests/${usage.id}/create-purchase-request`, {}, 201);
  expect(reorder.spareRequestId).toBe(usage.id);
  expect(Number(reorder.requestedQuantity)).toBe(20);
  await expectApiError(await api.post(`/spare-part-reorders/${reorder.id}/receive-stock`, { quantity: -1 }), 400);
  await api.putData(`/spare-part-reorders/${reorder.id}`, { status: 'ORDERED', remarks: runId });
  expect((await api.postData<Entity>(`/spare-part-reorders/${reorder.id}/receive-stock`, { quantity: 20, unitCost: 10 })).status).toBe('RECEIVED');
  expect((await api.getData<Entity>(`/spare-requests/${usage.id}`)).status).toBe('PURCHASE_RECEIVED');
  expect(Number((await api.getData<Entity>(`/spare-parts/${spare.stockId}`)).currentStock)).toBe(120);
  const purchases = await api.getData<Entity[]>(`/spare-part-reorders?siteId=${data.site.id}&status=RECEIVED`);
  expect(purchases.map((item) => item.id)).toContain(reorder.id);
});
