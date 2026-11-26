import { test, expect } from '../../fixtures/cmms.fixture.js';
import { createMasterData, type Entity } from '../../fixtures/core-data.js';
import { createAccount } from '../../fixtures/accounts.js';
import { requestData } from '../../data/factories.js';
import { expectApiError } from '../../helpers/api-envelope.js';

// This project runs alone after the ordinary suites because these settings are global.
for (const decision of ['approve', 'reject'] as const) {
  test(`@workflow @regression @security ${decision} updates request/history and notification ownership is enforced`, async ({ api, resources, runId }) => {
    const data = await createMasterData(api, resources, runId);
    const manager = await createAccount(api, resources, runId, data.site.id,
      ['APPROVAL_VIEW', 'APPROVAL_APPROVE', 'APPROVAL_REJECT', 'NOTIFICATION_VIEW', 'NOTIFICATION_UPDATE'], 'MANAGER');
    const outsider = await createAccount(api, resources, runId, data.site.id,
      ['NOTIFICATION_VIEW', 'NOTIFICATION_UPDATE'], 'VIEWER');
    const configs = await api.getData<Entity[]>('/admin/approval-config');
    const original = configs.find((item) => item.moduleCode === 'MAINTENANCE_REQUEST' && item.actionCode === 'CREATE');
    expect(original, 'Default maintenance request creation approval config').toBeDefined();
    resources.add('restore request approval config', () => api.putData(`/admin/approval-config/${original!.id}`, original));
    await api.putData(`/admin/approval-config/${original!.id}`, {
      ...original, approvalRequired: true, approverRoleCode: manager.role.roleCode, minApprovalCount: 1, status: 'ACTIVE',
    });
    const created = await api.postData<Entity>('/maintenance/requests', requestData(runId, data.site.id, data.equipment.id), 201);
    resources.add(`request ${created.id}`, () => api.deleteData(`/maintenance/requests/${created.id}`));
    expect(created.status, 'Backend must start with cmms.approval.enabled=true').toBe('PENDING_APPROVAL');
    const pending = await manager.api.getData<Entity[]>('/approvals/pending');
    const approval = pending.find((item) => item.referenceId === created.id && item.moduleCode === 'MAINTENANCE_REQUEST');
    expect(approval).toBeDefined();
    await expectApiError(await outsider.api.post(`/approvals/${approval!.id}/approve`, {}), 403);
    const inbox = await manager.api.getData<{ content: Entity[] }>('/notifications?size=100');
    const notification = inbox.content.find((item) => item.referenceId === created.id && item.moduleCode === 'MAINTENANCE_REQUEST');
    expect(notification, 'Approver receives a notification for the newly created approval').toBeDefined();
    await expectApiError(await outsider.api.put(`/notifications/${notification!.id}/read`), 403);
    await manager.api.putData(`/notifications/${notification!.id}/read`);
    await manager.api.putData(`/notifications/${notification!.id}/archive`);
    const result = await manager.api.postData<Entity>(`/approvals/${approval!.id}/${decision}`, { comments: `${runId} ${decision}` });
    expect(result.approvalStatus).toBe(decision === 'approve' ? 'APPROVED' : 'REJECTED');
    expect((await api.getData<Entity>(`/maintenance/requests/${created.id}`)).status).toBe(decision === 'approve' ? 'OPEN' : 'REJECTED');
    const history = await manager.api.getData<Entity[]>(`/approvals/history?moduleCode=MAINTENANCE_REQUEST&referenceId=${created.id}`);
    expect(history.find((item) => item.id === approval!.id)?.approvalStatus).toBe(result.approvalStatus);
    await expectApiError(await manager.api.post(`/approvals/${approval!.id}/${decision}`, {}), 400);
  });
}

test('@regression notification settings persist valid changes and reject invalid schedules', async ({ api, resources }) => {
  const original = await api.getData<Entity>('/admin/notification-settings');
  resources.add('restore notification settings', () => api.putData('/admin/notification-settings', original));
  const updated = { ...original, enabled: !original.enabled, scanTime: '06:15', pmReminderDays: 4 };
  await api.putData('/admin/notification-settings', updated);
  const persisted = await api.getData<Entity>('/admin/notification-settings');
  expect(persisted.enabled).toBe(updated.enabled);
  expect(persisted.scanTime).toBe('06:15');
  expect(persisted.pmReminderDays).toBe(4);
  await expectApiError(await api.put('/admin/notification-settings', { ...updated, scanTime: '25:61' }), 400);
  await expectApiError(await api.put('/admin/notification-settings', { ...updated, pmReminderDays: -1 }), 400);
  expect((await api.getData<Entity>('/admin/notification-settings')).scanTime).toBe('06:15');
});
