import { randomUUID } from 'node:crypto';
import type { CmmsApiClient } from '../api/cmms-api-client.js';
import { CmmsApiClient as Client } from '../api/cmms-api-client.js';
import type { ResourceTracker } from '../helpers/resource-tracker.js';
import { authenticatedContext } from '../helpers/auth.js';
import { employeeData } from '../data/factories.js';
import type { Entity } from './core-data.js';

/** Real, least-privilege accounts; no pre-existing viewer/technician credentials. */
export async function createAccount(api: CmmsApiClient, resources: ResourceTracker,
  runId: string, siteId: number, permissionCodes: string[], suffix = 'USER') {
  const catalog = await api.getData<Array<{ id: number; permissionCode: string }>>('/admin/permissions');
  const permissionIds = permissionCodes.map((code) => {
    const permission = catalog.find((item) => item.permissionCode === code);
    if (!permission) throw new Error(`Permission fixture does not exist: ${code}`);
    return permission.id;
  });
  const role = await api.postData<Entity>('/admin/roles', {
    roleCode: `${runId}_${suffix}`.replaceAll('-', '_').toUpperCase(),
    roleName: `${runId} ${suffix}`, status: 'ACTIVE', permissionIds,
  }, 201);
  resources.add(`role ${role.id}`, () => api.deleteData(`/admin/roles/${role.id}`));
  const password = `E2e!${randomUUID()}`;
  const payload = {
    ...employeeData(runId, siteId, suffix), loginEnabled: true,
    username: `${runId}-${suffix}`.toLowerCase(), password, confirmPassword: password,
    authRole: 'EMPLOYEE', accountStatus: 'ACTIVE',
    roleAssignments: [{ roleId: role.id, siteId, status: 'ACTIVE' }],
  };
  const employee = await api.postData<Entity & { userId: number }>('/hr/employees', payload, 201);
  resources.add(`employee ${employee.id}`, () => api.deleteData(`/hr/employees/${employee.id}`));
  resources.add(`disable account ${employee.userId}`, async () => {
    const current = await api.getData<Entity>(`/hr/employees/${employee.id}`);
    await api.putData(`/hr/employees/${employee.id}`, {
      ...current, loginEnabled: false, password: undefined, confirmPassword: undefined, roleAssignments: [],
    });
  });
  const context = await authenticatedContext(payload.username, password);
  resources.add(`session ${employee.userId}`, () => context.dispose());
  return { api: new Client(context), context, employee, role, payload, password, username: payload.username };
}
