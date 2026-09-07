import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  __resetDateTimeForTests,
  endOfBusinessDayUtc,
  formatDate,
  formatDateTime,
  getDateTimeConfig,
  nowUtcIso,
  startOfBusinessDayUtc,
  startOfNextBusinessDayUtc,
  synchronizeDateTime,
  toDateTimeInput,
  toUtcDateTime,
} from './dateTime.js';

const configure = (timeZone, serverInstant = '2026-09-07T06:38:32.984Z') => {
  const epoch = Date.parse(serverInstant);
  synchronizeDateTime({ serverInstant, timeZone, locale: 'en-IN' }, epoch, epoch);
};

test.afterEach(() => __resetDateTimeForTests());

test('formats UTC instants in the backend-configured business zone', () => {
  configure('Asia/Kolkata');
  assert.equal(formatDate('2026-09-07'), '07 Sep 2026');
  assert.equal(formatDateTime('2026-09-07T06:38:32.984Z'), '07 Sep 2026, 12:08 PM');
  assert.equal(getDateTimeConfig().timeZone, 'Asia/Kolkata');
});

test('datetime-local values round trip through UTC', () => {
  configure('Asia/Kolkata');
  const utc = toUtcDateTime('2026-09-07T12:08');
  assert.equal(utc, '2026-09-07T06:38:00.000Z');
  assert.equal(toDateTimeInput(utc), '2026-09-07T12:08');
});

test('day boundaries honor daylight-saving transitions', () => {
  configure('America/New_York');
  const start = startOfBusinessDayUtc('2026-03-08');
  const next = startOfNextBusinessDayUtc('2026-03-08');
  assert.equal(start, '2026-03-08T05:00:00.000Z');
  assert.equal(next, '2026-03-09T04:00:00.000Z');
  assert.equal(Date.parse(next) - Date.parse(start), 23 * 60 * 60 * 1000);
  assert.equal(endOfBusinessDayUtc('2026-03-08'), '2026-03-09T03:59:59.999Z');
});

test('rejects a nonexistent local time in a DST gap', () => {
  configure('America/New_York');
  assert.equal(toUtcDateTime('2026-03-08T02:30'), null);
});

test('date-only values do not shift when the display zone changes', () => {
  configure('UTC');
  const utcDate = formatDate('2026-09-07');
  configure('America/New_York');
  assert.equal(formatDate('2026-09-07'), utcDate);
});

test('server drift is applied to centralized now', () => {
  const originalNow = Date.now;
  Date.now = () => 1_000;
  try {
    synchronizeDateTime({ serverInstant: '1970-01-01T00:00:03.000Z', timeZone: 'UTC', locale: 'en-IN' }, 0, 2_000);
    assert.equal(nowUtcIso(), '1970-01-01T00:00:03.000Z');
  } finally {
    Date.now = originalNow;
  }
});

test('invalid timestamps use the provided fallback', () => {
  configure('UTC');
  assert.equal(formatDateTime('not-a-time', 'Unavailable'), 'Unavailable');
  assert.equal(toDateTimeInput('not-a-time'), '');
});
