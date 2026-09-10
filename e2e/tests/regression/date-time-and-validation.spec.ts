import { test, expect } from '../../fixtures/cmms.fixture.js';
import { expectApiError, expectSuccess } from '../../helpers/api-envelope.js';

test('@regression public time API returns synchronized UTC and configurable business time', async ({ api }) => {
  const value = await expectSuccess<Record<string, string | number>>(await api.get('/system/time'));
  expect(String(value.serverInstant)).toMatch(/Z$/);
  expect(Number(value.epochMillis)).toBeGreaterThan(0);
  expect(String(value.timeZone)).not.toBe('');
  expect(String(value.locale)).not.toBe('');
  expect(Math.abs(Date.now() - Number(value.epochMillis))).toBeLessThan(30_000);
});

test('@regression timezone-less timestamps and hostile validation strings never cause 500', async ({ api }) => {
  const response = await api.post('/maintenance/downtime', {
    equipmentId: 999999999, siteId: 999999999, downtimeStart: '2026-09-07T12:00:00',
    reason: `<script>alert(1)</script>'\"%_`,
  });
  expect(response.status()).not.toBe(500);
  expect([400, 403, 404]).toContain(response.status());
  await expectApiError(response, response.status());
});
