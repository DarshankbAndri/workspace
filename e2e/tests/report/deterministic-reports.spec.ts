import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMaintenanceData, type Entity } from '../../fixtures/core-data.js';
import { equipmentData, assignmentData } from '../../data/factories.js';
import { createAccount } from '../../fixtures/accounts.js';
import { expectApiError } from '../../helpers/api-envelope.js';
import type { SearchPage } from '../../api/cmms-api-client.js';

type CostReport = { page: SearchPage<Entity>; summary: Record<string, number> };

test('@api @regression reports and dashboard reconcile deterministic site fixtures', async ({ api, resources, runId }) => {
  const data = await createMaintenanceData(api, resources, runId);
  await api.putData(`/equipment/${data.equipment.id}`, {
    ...equipmentData(runId, data.site.id, data.vendor.id), purchaseCost: 1000,
  });
  await api.putData(`/maintenance/assignments/${data.assignment.id}`, {
    ...assignmentData(runId, data.site.id, data.request.id, data.vendor.id, data.employee.id), actualCost: 25,
  });
  const report = await api.getData<CostReport>(`/reports/equipment-maintenance-cost?equipmentId=${data.equipment.id}&siteId=${data.site.id}`);
  expect(report.page.totalRecords).toBe(1);
  expect(report.page.data[0].equipmentId).toBe(data.equipment.id);
  expect(Number(report.page.data[0].purchaseCost)).toBe(1000);
  expect(Number(report.page.data[0].maintenanceCost)).toBe(25);
  expect(Number(report.summary.totalCostOfOwnership)).toBe(1025);
  for (const group of ['site', 'category', 'criticality']) {
    const grouped = await api.getData<CostReport>(`/reports/equipment-cost-by-${group}?siteId=${data.site.id}`);
    expect(grouped.page.totalRecords).toBe(1);
    expect(Number(grouped.page.data[0].assetCount)).toBe(1);
    expect(Number(grouped.page.data[0].totalCostOfOwnership)).toBe(1025);
    expect(grouped.summary).toEqual(report.summary);
  }
  const history = await api.getData<SearchPage<Entity>>(`/reports/equipment-history?equipmentId=${data.equipment.id}&siteId=${data.site.id}`);
  expect(history.data.map((row) => row.id)).toEqual(expect.arrayContaining([`REQ-${data.request.id}`, `ASN-${data.assignment.id}`]));
  expect(history.data.every((row) => row.equipmentId === data.equipment.id)).toBe(true);
  const dashboard = await api.getData<Entity>(`/dashboard/summary?siteId=${data.site.id}`);
  expect(dashboard.totalEquipments).toBe(1);
  const other = await createMaintenanceData(api, resources, `${runId}-B`);
  const scoped = await createAccount(api, resources, runId, data.site.id, ['REPORT_VIEW', 'DASHBOARD_VIEW']);
  const own = await scoped.api.getData<CostReport>('/reports/equipment-maintenance-cost');
  expect(own.page.data.map((row) => row.equipmentId)).toEqual([data.equipment.id]);
  await expectApiError(await scoped.api.get(`/reports/equipment-maintenance-cost?siteId=${other.site.id}`), 403);
  await expectApiError(await scoped.api.get(`/dashboard/summary?siteId=${other.site.id}`), 403);
});
