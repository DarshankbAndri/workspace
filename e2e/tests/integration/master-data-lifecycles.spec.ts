import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData } from '../../fixtures/core-data.js';
import { employeeData, equipmentData, vendorData } from '../../data/factories.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@regression employees, vendors and equipment update and validate duplicates', async ({ api, resources, runId }) => {
  const data = await createMasterData(api, resources, runId);
  const employee = await api.putData<Record<string, unknown>>(`/hr/employees/${data.employee.id}`, {
    ...employeeData(runId, data.site.id), id: data.employee.id, designation: 'Senior Technician',
  });
  expect(employee.designation).toBe('Senior Technician');
  const vendor = await api.putData<Record<string, unknown>>(`/vendors/${data.vendor.id}`, {
    ...vendorData(runId, data.site.id), id: data.vendor.id, contactPerson: 'Updated E2E Contact',
  });
  expect(vendor.contactPerson).toBe('Updated E2E Contact');
  const equipment = await api.putData<Record<string, unknown>>(`/equipment/${data.equipment.id}`, {
    ...equipmentData(runId, data.site.id, data.vendor.id), id: data.equipment.id, location: 'E2E Bay 2',
  });
  expect(equipment.location).toBe('E2E Bay 2');
  await expectApiError(await api.post('/equipment', equipmentData(runId, data.site.id, data.vendor.id)), 400);
  await expectApiError(await api.post('/hr/employees', { ...employeeData(runId, data.site.id), email: 'not-an-email' }), 400);
});

test('@regression roles persist permission assignments and reject duplicates', async ({ api, resources, runId }) => {
  const permissions = await api.getData<Array<Record<string, unknown>>>('/admin/permissions');
  expect(permissions.length).toBeGreaterThan(0);
  const permissionId = Number(permissions[0].id ?? permissions[0].permissionId);
  const roleCode = `${runId.replaceAll('-', '_')}_ROLE`.slice(0, 80);
  const role = await api.postData<Record<string, unknown>>('/admin/roles', {
    roleCode, roleName: `${runId} Role`, description: 'E2E role', status: 'ACTIVE', permissionIds: [permissionId],
  }, 201);
  resources.add(`role ${role.id}`, () => api.deleteData(`/admin/roles/${role.id}`));
  expect((role.permissionIds as unknown[]).map(Number)).toContain(permissionId);
  const updated = await api.putData<Record<string, unknown>>(`/admin/roles/${role.id}`, {
    ...role, description: 'Updated E2E role', permissionIds: [permissionId],
  });
  expect(updated.description).toBe('Updated E2E role');
  await expectApiError(await api.post('/admin/roles', {
    roleCode, roleName: 'Duplicate', status: 'ACTIVE', permissionIds: [],
  }), 400);
});
