import http from 'k6/http';
import { check, fail, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:6200/api').replace(/\/+$/, '');
const USERNAME = __ENV.CMMS_USERNAME;
const PASSWORD = __ENV.CMMS_PASSWORD;
const PROFILE = (__ENV.PROFILE || 'smoke').toLowerCase();
const REPORT_PATH = __ENV.REPORT_PATH || 'reports/summary.json';

if (!USERNAME || !PASSWORD) {
  throw new Error('CMMS_USERNAME and CMMS_PASSWORD are required. Do not store the password in Git.');
}

const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
const remoteHttpMatch = /^http:\/\/([^/:]+)/i.exec(BASE_URL);
if (remoteHttpMatch && !localHosts.has(remoteHttpMatch[1]) && __ENV.ALLOW_INSECURE_HTTP !== 'true') {
  throw new Error('Refusing to transmit credentials over remote HTTP. Use HTTPS or set ALLOW_INSECURE_HTTP=true after accepting the risk.');
}

const applicationErrors = new Rate('application_errors');
const loginFailures = new Counter('login_failures');
const dashboardDuration = new Trend('dashboard_duration', true);
const searchDuration = new Trend('search_duration', true);

const profiles = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '30s',
    gracefulStop: '10s',
  },
  baseline: {
    executor: 'constant-vus',
    vus: 10,
    duration: '2m',
    gracefulStop: '20s',
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 25 },
      { duration: '2m', target: 25 },
      { duration: '1m', target: 50 },
      { duration: '3m', target: 50 },
      { duration: '1m', target: 100 },
      { duration: '3m', target: 100 },
      { duration: '30s', target: 0 },
    ],
    gracefulRampDown: '30s',
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 100 },
      { duration: '3m', target: 100 },
      { duration: '1m', target: 200 },
      { duration: '3m', target: 200 },
      { duration: '1m', target: 300 },
      { duration: '3m', target: 300 },
      { duration: '1m', target: 0 },
    ],
    gracefulRampDown: '30s',
  },
  custom: {
    executor: 'constant-vus',
    vus: Number(__ENV.VUS || 10),
    duration: __ENV.DURATION || '2m',
    gracefulStop: '30s',
  },
};

if (!profiles[PROFILE]) {
  throw new Error(`Unknown PROFILE '${PROFILE}'. Use smoke, baseline, load, stress, or custom.`);
}

export const options = {
  scenarios: {
    cmms_users: profiles[PROFILE],
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    application_errors: ['rate<0.01'],
    http_req_duration: ['p(95)<1000', 'p(99)<2500'],
    dashboard_duration: ['p(95)<2000'],
    search_duration: ['p(95)<1000'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  userAgent: 'CMMS-k6-performance-test/1.0',
};

let token;

function jsonHeaders(authToken) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Correlation-Id': `k6-vu-${__VU}-iteration-${__ITER}`,
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

function envelopeSucceeded(response) {
  if (response.status < 200 || response.status >= 300) return false;
  try {
    const body = response.json();
    return body && body.success === true;
  } catch (_) {
    return false;
  }
}

function validate(response, label) {
  const passed = check(response, {
    [`${label}: HTTP 2xx`]: (r) => r.status >= 200 && r.status < 300,
    [`${label}: API success envelope`]: envelopeSucceeded,
  });
  applicationErrors.add(!passed, { endpoint: label });
  return passed;
}

function login() {
  const response = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: USERNAME, password: PASSWORD }),
    { headers: jsonHeaders(), tags: { name: 'POST /auth/login' }, timeout: '30s' },
  );

  if (!validate(response, 'login')) {
    loginFailures.add(1);
    fail(`Login failed with HTTP ${response.status}.`);
  }

  const value = response.json('data.token');
  if (!value) {
    loginFailures.add(1);
    fail('Login response did not contain data.token.');
  }
  return value;
}

function get(path, name, trend) {
  const response = http.get(`${BASE_URL}${path}`, {
    headers: jsonHeaders(token),
    tags: { name },
    timeout: '30s',
  });
  if (trend) trend.add(response.timings.duration, { endpoint: name });
  validate(response, name);
  return response;
}

function search(path, name, pageSize = 25) {
  const payload = {
    searchCriteriaList: [],
    dataOption: 'all',
    pagination: {
      status: 'ON',
      recordsPerPage: pageSize,
      sortBy: null,
      sortMode: null,
      pageNumber: __ITER % 4,
      pageSize: 0,
    },
  };
  const response = http.post(`${BASE_URL}${path}`, JSON.stringify(payload), {
    headers: jsonHeaders(token),
    tags: { name },
    timeout: '30s',
  });
  searchDuration.add(response.timings.duration, { endpoint: name });
  validate(response, name);
}

function dashboardJourney() {
  group('dashboard', () => {
    get('/dashboard/me', 'GET /dashboard/me', dashboardDuration);
    const requests = [
      ['GET', `${BASE_URL}/dashboard/widgets/overview/kpi-summary`, null, { headers: jsonHeaders(token), tags: { name: 'GET dashboard KPI' } }],
      ['GET', `${BASE_URL}/dashboard/widgets/equipment/status`, null, { headers: jsonHeaders(token), tags: { name: 'GET equipment status widget' } }],
      ['GET', `${BASE_URL}/dashboard/widgets/reports/downtime-summary`, null, { headers: jsonHeaders(token), tags: { name: 'GET downtime widget' } }],
      ['GET', `${BASE_URL}/dashboard/widgets/maintenance/open-requests`, null, { headers: jsonHeaders(token), tags: { name: 'GET open requests widget' } }],
      ['GET', `${BASE_URL}/dashboard/widgets/inventory/low-stock`, null, { headers: jsonHeaders(token), tags: { name: 'GET low stock widget' } }],
    ];
    const responses = http.batch(requests);
    responses.forEach((response, index) => {
      dashboardDuration.add(response.timings.duration, { endpoint: requests[index][3].tags.name });
      validate(response, requests[index][3].tags.name);
    });
  });
}

const searches = [
  ['/equipment/search', 'POST /equipment/search'],
  ['/maintenance/requests/search', 'POST /maintenance/requests/search'],
  ['/maintenance/assignments/search', 'POST /maintenance/assignments/search'],
  ['/maintenance/downtime/search', 'POST /maintenance/downtime/search'],
  ['/spare-parts/search', 'POST /spare-parts/search'],
  ['/preventive-maintenance/schedules/search', 'POST /preventive-maintenance/schedules/search'],
  ['/hr/employees/search', 'POST /hr/employees/search'],
  ['/vendors/search', 'POST /vendors/search'],
  ['/hr/sites/search', 'POST /hr/sites/search'],
  ['/approvals/history/search', 'POST /approvals/history/search'],
];

export function setup() {
  const response = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: USERNAME, password: PASSWORD }),
    { headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, timeout: '15s' },
  );
  if (response.status < 200 || response.status >= 300) {
    fail(`Preflight login failed with HTTP ${response.status}. Stop before applying load.`);
  }
}

export default function () {
  if (!token) token = login();

  const choice = __ITER % 10;
  if (choice < 3) {
    dashboardJourney();
  } else if (choice < 9) {
    const selected = searches[(__VU + __ITER) % searches.length];
    search(selected[0], selected[1]);
  } else {
    get('/notifications?page=0&size=20', 'GET /notifications');
    get('/notifications/unread-count', 'GET /notifications/unread-count');
  }

  sleep(0.5 + Math.random() * 1.5);
}

export function handleSummary(data) {
  return {
    [REPORT_PATH]: `${JSON.stringify(data, null, 2)}\n`,
    stdout: `\nCMMS performance test completed. Profile: ${PROFILE}. Report: ${REPORT_PATH}\n`,
  };
}
