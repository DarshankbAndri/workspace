import { test, expect } from '../../fixtures/cmms.fixture.js';

test('@api @regression notification APIs are available to the seeded administrator', async ({ api }) => {
  const me = await api.getData<{ permissions: string[] }>('/auth/me');
  expect(me.permissions).toEqual(expect.arrayContaining([
    'NOTIFICATION_VIEW', 'NOTIFICATION_UPDATE', 'NOTIFICATION_CONFIG_VIEW', 'NOTIFICATION_CONFIG_UPDATE',
  ]));

  const notifications = await api.getData<{ content: unknown[] }>('/notifications?page=0&size=6');
  expect(Array.isArray(notifications.content)).toBeTruthy();
  const unread = await api.getData<{ count: number }>('/notifications/unread-count');
  expect(unread.count).toBeGreaterThanOrEqual(0);
  await api.getData('/admin/notification-settings');
});
