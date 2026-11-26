import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMaintenanceData, type Entity } from '../../fixtures/core-data.js';
import { createAccount } from '../../fixtures/accounts.js';
import { assignmentData, searchPage } from '../../data/factories.js';
import type { SearchPage } from '../../api/cmms-api-client.js';

test('@security @regression my assignments enforces technician identity despite caller filters', async ({ api, resources, runId }) => {
  const data = await createMaintenanceData(api, resources, runId);
  const technician = await createAccount(api, resources, runId, data.site.id, ['ASSIGNMENT_VIEW'], 'TECH');
  await api.putData(`/maintenance/assignments/${data.assignment.id}`, {
    ...assignmentData(runId, data.site.id, data.request.id, data.vendor.id, technician.employee.id),
  });
  const other = await createAccount(api, resources, runId, data.site.id, ['ASSIGNMENT_VIEW'], 'OTHER');
  const mine = await technician.api.getData<Entity[]>('/maintenance/assignments/my');
  expect(mine.map((item) => item.id)).toContain(data.assignment.id);
  expect(mine.every((item) => item.assignedEmployeeId === technician.employee.id)).toBe(true);
  const foreign = await other.api.search<SearchPage<Entity>>('/maintenance/assignments/my/search', {
    ...searchPage(), dataOption: 'any', searchCriteriaList: [
      { filterKey: 'assignedEmployeeId', dataType: 'NUMBER', operation: 'eq', value: technician.employee.id },
    ],
  });
  expect(foreign.data).toEqual([]);
  expect(foreign.totalRecords).toBe(0);
  const profile = await technician.api.getData<Entity>('/auth/profile');
  expect(profile.userId).toBe(technician.employee.userId);
  expect(profile.employeeId).toBe(technician.employee.id);
});
