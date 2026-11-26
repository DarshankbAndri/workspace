import { request } from '@playwright/test';
import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createAccount } from '../../fixtures/accounts.js';
import { createMasterData, type Entity } from '../../fixtures/core-data.js';
import { authenticatedContext } from '../../helpers/auth.js';
import { env } from '../../helpers/env.js';
import { expectApiError, expectSuccess } from '../../helpers/api-envelope.js';

test('@auth @security @regression password changes and disabled accounts enforce login state', async ({ api, resources, runId }) => {
  const data = await createMasterData(api, resources, runId);
  const account = await createAccount(api, resources, runId, data.site.id, ['EQUIPMENT_VIEW']);
  const nextPassword = `${account.password}-changed`;
  await expectApiError(await account.api.post('/auth/change-password', {
    currentPassword: 'incorrect', newPassword: nextPassword, confirmPassword: nextPassword,
  }), 401);
  await expectApiError(await account.api.post('/auth/change-password', {
    currentPassword: account.password, newPassword: nextPassword, confirmPassword: 'mismatch',
  }), 400);
  await account.api.postData('/auth/change-password', {
    currentPassword: account.password, newPassword: nextPassword, confirmPassword: nextPassword,
  });
  const anonymous = await request.newContext({ baseURL: env.apiBaseUrl });
  try {
    await expectApiError(await anonymous.post('auth/login', { data: {
      username: account.username, password: account.password,
    } }), 401);
    const login = await expectSuccess<{ user: Entity }>(await anonymous.post('auth/login', { data: {
      username: account.username, password: nextPassword,
    } }));
    expect(login.user.id).toBe(account.employee.userId);
    await api.putData(`/hr/employees/${account.employee.id}`, {
      ...account.payload, password: undefined, confirmPassword: undefined, accountStatus: 'INACTIVE',
    });
    await expectApiError(await anonymous.post('auth/login', { data: {
      username: account.username, password: nextPassword,
    } }), 401);
    await expectApiError(await account.api.post('/auth/refresh'), 401);
  } finally { await anonymous.dispose(); }
});

test('@security @rbac @regression role permission changes invalidate access for an existing session', async ({ api, resources, runId }) => {
  const data = await createMasterData(api, resources, runId);
  const account = await createAccount(api, resources, runId, data.site.id, ['EQUIPMENT_VIEW']);
  await account.api.getData(`/equipment/${data.equipment.id}`);
  await api.putData(`/admin/roles/${account.role.id}`, { ...account.role, permissionIds: [], permissionCodes: [] });
  await expectApiError(await account.api.get(`/equipment/${data.equipment.id}`), 403);
  await api.putData(`/admin/roles/${account.role.id}`, account.role);
  await account.api.getData(`/equipment/${data.equipment.id}`);
  await api.putData(`/admin/users/${account.employee.userId}/roles`, []);
  await expectApiError(await account.api.get(`/equipment/${data.equipment.id}`), 403);
  const refreshed = await authenticatedContext(account.username, account.password);
  try { await expectApiError(await refreshed.get(`equipment/${data.equipment.id}`), 403); }
  finally { await refreshed.dispose(); }
});
