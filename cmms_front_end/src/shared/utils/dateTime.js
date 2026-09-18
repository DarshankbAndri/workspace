import { DateTime } from 'luxon';

const STORAGE_KEY = 'cmms:date-time-config';
const DEFAULT_CONFIG = Object.freeze({ timeZone: 'Asia/Kolkata', locale: 'en-IN' });

const readStoredConfig = () => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.timeZone && stored?.locale && DateTime.local().setZone(stored.timeZone).isValid) {
      return stored;
    }
  } catch {
    // Corrupt browser state should never prevent the application from starting.
  }
  return null;
};

let config = readStoredConfig() || DEFAULT_CONFIG;
let serverOffsetMillis = 0;

const persistConfig = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

const parseInstant = (value) => {
  if (!value || typeof value !== 'string') return DateTime.invalid('Missing timestamp');
  return DateTime.fromISO(value, { setZone: true });
};

const parseDateOnly = (value) => DateTime.fromISO(value, { zone: config.timeZone, locale: config.locale });

const formattedDate = (value) => {
  if (!config.locale.toLowerCase().startsWith('en')) return value.toFormat('dd LLL yyyy');
  return `${value.toFormat('dd')} ${value.toFormat('LLL').slice(0, 3)} ${value.toFormat('yyyy')}`;
};

const formattedTime = (value) => {
  const result = value.toFormat('hh:mm a');
  return config.locale.toLowerCase().startsWith('en') ? result.toUpperCase() : result;
};

export const getDateTimeConfig = () => ({ ...config, serverOffsetMillis });
export const clientEpochMillis = () => Date.now();

export const synchronizeDateTime = (payload, requestStartedAt = Date.now(), responseReceivedAt = Date.now()) => {
  const serverInstant = payload?.serverInstant || payload?.timestamp;
  const parsed = parseInstant(serverInstant);
  if (!parsed.isValid) return false;

  if (payload?.timeZone && DateTime.local().setZone(payload.timeZone).isValid) {
    config = {
      timeZone: payload.timeZone,
      locale: payload.locale || config.locale || DEFAULT_CONFIG.locale,
    };
    persistConfig();
  }

  const midpoint = requestStartedAt + ((responseReceivedAt - requestStartedAt) / 2);
  serverOffsetMillis = parsed.toMillis() - midpoint;
  return true;
};

export const now = () => DateTime.fromMillis(Date.now() + serverOffsetMillis, {
  zone: config.timeZone,
  locale: config.locale,
});

export const nowUtcIso = () => now().toUTC().toISO();
export const epochMillis = () => now().toMillis();
export const today = () => now().toISODate();
export const currentBusinessYear = () => now().year;
export const currentDateTimeInput = () => now().toFormat("yyyy-MM-dd'T'HH:mm");

export const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? parseDateOnly(value)
    : parseInstant(value).setZone(config.timeZone).setLocale(config.locale);
  return parsed.isValid ? formattedDate(parsed) : fallback;
};

export const formatDateTime = (value, fallback = '-') => {
  if (!value) return fallback;
  const parsed = parseInstant(value).setZone(config.timeZone).setLocale(config.locale);
  return parsed.isValid ? `${formattedDate(parsed)}, ${formattedTime(parsed)}` : fallback;
};

export const formatTime = (value, fallback = '-') => {
  if (!value) return fallback;
  const parsed = parseInstant(value).setZone(config.timeZone).setLocale(config.locale);
  return parsed.isValid ? formattedTime(parsed) : fallback;
};

export const formatCalendarHeading = (dateValue, view) => {
  const parsed = parseDateOnly(dateValue).setLocale(config.locale);
  if (!parsed.isValid) return '';
  if (view === 'month') return parsed.toFormat('LLLL yyyy');
  const start = parsed.startOf('week');
  return `${start.toFormat('LLL d')} - ${start.plus({ days: 6 }).toFormat('LLL d, yyyy')}`;
};

export const toDateTimeInput = (utcValue) => {
  const parsed = parseInstant(utcValue).setZone(config.timeZone);
  return parsed.isValid ? parsed.toFormat("yyyy-MM-dd'T'HH:mm") : '';
};

export const toBusinessDateInput = (utcValue) => {
  const parsed = parseInstant(utcValue).setZone(config.timeZone);
  return parsed.isValid ? parsed.toISODate() : '';
};

export const toUtcDateTime = (businessLocalValue) => {
  if (!businessLocalValue) return null;
  const parsed = DateTime.fromISO(businessLocalValue, { zone: config.timeZone });
  if (!parsed.isValid) return null;
  const normalizedInput = businessLocalValue.slice(0, 16);
  if (parsed.toFormat("yyyy-MM-dd'T'HH:mm") !== normalizedInput) return null;
  return parsed.toUTC().toISO();
};

export const startOfBusinessDayUtc = (dateValue) => {
  const parsed = parseDateOnly(dateValue).startOf('day');
  return parsed.isValid ? parsed.toUTC().toISO() : null;
};

export const startOfNextBusinessDayUtc = (dateValue) => {
  const parsed = parseDateOnly(dateValue).plus({ days: 1 }).startOf('day');
  return parsed.isValid ? parsed.toUTC().toISO() : null;
};

export const endOfBusinessDayUtc = (dateValue) => {
  const parsed = parseDateOnly(dateValue).plus({ days: 1 }).startOf('day').minus({ milliseconds: 1 });
  return parsed.isValid ? parsed.toUTC().toISO() : null;
};

export const compareInstants = (left, right) => {
  const leftMillis = parseInstant(left).toMillis();
  const rightMillis = parseInstant(right).toMillis();
  if (!Number.isFinite(leftMillis) || !Number.isFinite(rightMillis)) return Number.NaN;
  return leftMillis - rightMillis;
};

export const compareDateOnly = (left, right) => {
  const leftMillis = parseDateOnly(left).startOf('day').toMillis();
  const rightMillis = parseDateOnly(right).startOf('day').toMillis();
  if (!Number.isFinite(leftMillis) || !Number.isFinite(rightMillis)) return Number.NaN;
  return leftMillis - rightMillis;
};

export const daysBetweenDates = (start, end = today()) => {
  const startValue = parseDateOnly(start).startOf('day');
  const endValue = parseDateOnly(end).startOf('day');
  if (!startValue.isValid || !endValue.isValid) return Number.NaN;
  return Math.floor(endValue.diff(startValue, 'days').days);
};

export const durationMinutes = (start, end) => {
  const startValue = DateTime.fromISO(start, { zone: config.timeZone });
  const endValue = DateTime.fromISO(end, { zone: config.timeZone });
  if (!startValue.isValid || !endValue.isValid) return 0;
  return Math.round(endValue.diff(startValue, 'minutes').minutes);
};

export const dateKey = (value) => {
  if (typeof value === 'string') return parseDateOnly(value).toISODate();
  if (DateTime.isDateTime(value)) return value.setZone(config.timeZone).toISODate();
  return '';
};

export const calendarDate = (value = today()) => parseDateOnly(value);

export const __resetDateTimeForTests = () => {
  config = DEFAULT_CONFIG;
  serverOffsetMillis = 0;
};
