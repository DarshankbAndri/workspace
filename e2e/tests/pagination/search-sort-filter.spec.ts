import { test, expect } from '../../fixtures/cmms.fixture.js';
import type { SearchPage } from '../../api/cmms-api-client.js';
import { searchPage } from '../../data/factories.js';
import { expectApiError } from '../../helpers/api-envelope.js';

const modules = [
  { path: '/hr/sites/search', sort: 'siteCode' },
  { path: '/hr/employees/search', sort: 'employeeCode' },
  { path: '/equipment/search', sort: 'equipmentCode' },
  { path: '/maintenance/requests/search', sort: 'requestNumber' },
  { path: '/maintenance/assignments/search', sort: 'createdAt' },
  { path: '/maintenance/assignments/my/search', sort: 'createdAt' },
  { path: '/approvals/pending/search', sort: 'requestedAt' },
  { path: '/maintenance/downtime/search', sort: 'createdAt' },
  { path: '/preventive-maintenance/schedules/search', sort: 'scheduleCode' },
  { path: '/spare-parts/search', sort: 'partCode' },
  { path: '/vendors/search', sort: 'vendorCode' },
  { path: '/vendor-amc/search', sort: 'contractNumber' },
  { path: '/admin/roles/search', sort: 'roleCode' },
];

test.describe('@regression @pagination @api server pagination', () => {
  for (const module of modules) {
    test(`${module.path} enforces page size and deterministic sorting`, async ({ api }) => {
      const asc = await api.search<SearchPage<Record<string, unknown>>>(module.path, searchPage(0, 10, module.sort, 'ASC'));
      expect(asc.pageNumber).toBe(0);
      expect(asc.pageSize).toBe(10);
      expect(asc.data.length).toBeLessThanOrEqual(10);
      expect(asc.totalRecords).toBeGreaterThanOrEqual(asc.data.length);
      const values = asc.data.map((row) => row[module.sort]).filter((value) => value != null).map(String);
      expect(values).toEqual([...values].sort((a, b) => a.localeCompare(b)));

      const desc = await api.search<SearchPage<Record<string, unknown>>>(module.path, searchPage(0, 25, module.sort, 'DESC'));
      expect(desc.pageSize).toBe(25);
      expect(desc.data.length).toBeLessThanOrEqual(25);
    });
  }

  test('equipment search handles partial, nonexistent, special and invalid sort input safely', async ({ api }) => {
    const partial = await api.search<SearchPage<Record<string, unknown>>>('/equipment/search', {
      ...searchPage(0, 10, 'equipmentCode', 'ASC'), dataOption: 'all',
      searchCriteriaList: [{ filterKey: 'commonSearch', dataType: 'VARCHAR', value: 'PERF-', operation: 'contains' }],
    });
    expect(partial.data.length).toBeLessThanOrEqual(10);
    const missing = await api.search<SearchPage<Record<string, unknown>>>('/equipment/search', {
      ...searchPage(0, 10, 'equipmentCode', 'ASC'),
      searchCriteriaList: [{ filterKey: 'commonSearch', dataType: 'VARCHAR', value: "<script>'%_NO_MATCH", operation: 'contains' }],
    });
    expect(missing.totalRecords).toBe(0);
    await expectApiError(await api.post('/equipment/search', searchPage(0, 10, 'notARealField', 'ASC')), 400);
  });

  test('@security identity-controlled searches ignore caller attempts to weaken server filters', async ({ api }) => {
    const pending = await api.search<SearchPage<Record<string, unknown>>>('/approvals/pending/search', {
      ...searchPage(0, 10, 'requestedAt', 'DESC'),
      searchCriteriaList: [
        { filterKey: 'approvalStatus', dataType: 'VARCHAR', value: 'APPROVED', operation: 'equal' },
      ],
    });
    expect(pending.data.every((row) => row.approvalStatus === 'PENDING')).toBe(true);

    const baseline = await api.search<SearchPage<Record<string, unknown>>>(
      '/maintenance/assignments/my/search',
      searchPage(0, 10, 'createdAt', 'DESC'),
    );
    const callerOverride = await api.search<SearchPage<Record<string, unknown>>>('/maintenance/assignments/my/search', {
      ...searchPage(0, 10, 'createdAt', 'DESC'),
      searchCriteriaList: [
        { filterKey: 'assignedEmployeeId', dataType: 'NUMBER', value: 922337203685477, operation: 'equal' },
      ],
    });
    expect(callerOverride.totalRecords).toBe(baseline.totalRecords);
    expect(callerOverride.data.map((row) => row.id)).toEqual(baseline.data.map((row) => row.id));
  });
});
