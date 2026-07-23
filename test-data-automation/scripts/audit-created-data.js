const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = (process.env.CMMS_BASE_URL || 'http://localhost:6200').replace(/\/$/, '');
const USERNAME = process.env.CMMS_USERNAME || 'superadmin';
const PASSWORD = process.env.CMMS_PASSWORD;
const PREFIX = (process.env.RUN_PREFIX || 'SOLAR-DEMO').toUpperCase();
const TARGET = Number(process.env.RECORD_COUNT || 100);
const JSON_PATH = path.join(ROOT, 'reports', 'data-creation-report.json');
const CSV_PATH = path.join(ROOT, 'reports', 'data-creation-report.csv');
const INSTALLED_BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
if (!PASSWORD) throw new Error('CMMS_PASSWORD is required.');

const unwrap = (value) => value?.success === true && 'data' in value ? value.data : value;
const rows = (value) => { const data = unwrap(value); return Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []; };
const csv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

(async () => {
  const launch = { headless: process.env.HEADLESS !== 'false' };
  const executablePath = process.env.BROWSER_EXECUTABLE_PATH || INSTALLED_BROWSER_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (executablePath) launch.executablePath = executablePath;
  const browser = await chromium.launch(launch);
  const page = await browser.newPage();
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Username').fill(USERNAME); await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: /^(Login|Sign in)$/i }).click();
    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 30000 });
    const api = (endpoint) => page.evaluate(async (target) => {
      const response = await fetch(`/api${target}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, signal: AbortSignal.timeout(30000) });
      const text = await response.text(); const body = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(`${response.status} ${body?.message || response.statusText}`); return body;
    }, endpoint);

    const sites = rows(await api('/hr/sites')).filter((r) => r.siteCode?.startsWith(PREFIX));
    const roles = rows(await api('/admin/roles')).filter((r) => r.roleCode?.startsWith(PREFIX));
    const employees = rows(await api('/hr/employees')).filter((r) => r.employeeCode?.startsWith(PREFIX));
    const vendors = rows(await api('/vendors')).filter((r) => r.vendorCode?.startsWith(PREFIX));
    const equipment = rows(await api('/equipment')).filter((r) => r.equipmentCode?.startsWith(PREFIX));
    const equipmentIds = new Set(equipment.map((r) => String(r.id)));
    const spareParts = [];
    for (const site of sites) spareParts.push(...rows(await api(`/spare-parts/site/${site.id}`)).filter((r) => r.partCode?.startsWith(PREFIX)));
    const spareIds = new Set(spareParts.map((r) => String(r.id)));
    const pm = rows(await api('/preventive-maintenance/schedules')).filter((r) => equipmentIds.has(String(r.equipmentId)) && / - \d{3}$/.test(r.title || ''));
    const requests = rows(await api('/maintenance/requests')).filter((r) => r.title?.includes(PREFIX));
    const requestIds = new Set(requests.map((r) => String(r.id)));
    const assignments = rows(await api('/maintenance/assignments')).filter((r) => requestIds.has(String(r.requestId)));
    let workLogs = 0; let spareRequests = 0;
    for (const assignment of assignments) {
      workLogs += rows(await api(`/maintenance/assignments/${assignment.id}/work-logs`)).length;
      spareRequests += rows(await api(`/maintenance/assignments/${assignment.id}/spares`)).length;
    }
    const downtime = rows(await api('/maintenance/downtime')).filter((r) => r.reason?.startsWith(`${PREFIX}:`));
    let purchaseRequests = null; let purchaseAuditError = '';
    try { purchaseRequests = rows(await api('/spare-part-reorders')).filter((r) => spareIds.has(String(r.stockId))).length; }
    catch (error) { purchaseAuditError = error.message; }

    const counts = { sites: sites.length, roles: roles.length, employees: employees.length, vendors: vendors.length, equipment: equipment.length, spareParts: spareParts.length, preventiveMaintenance: pm.length, maintenanceRequests: requests.length, assignments: assignments.length, workLogs, spareRequests, downtime: downtime.length, purchaseRequests };
    const now = new Date().toISOString();
    const modules = Object.entries(counts).map(([module, count]) => ({
      module, requestedCount: TARGET, successCount: count ?? 0, failedCount: count == null ? TARGET : Math.max(0, TARGET - count), skippedCount: 0,
      startTime: now, endTime: now,
      failureReason: count == null ? `Unable to audit: ${purchaseAuditError}` : count < TARGET ? `Actual prefixed count is ${count}; target is ${TARGET}.` : '',
    }));
    modules.unshift({ module: 'company', requestedCount: 1, successCount: 0, failedCount: 0, skippedCount: 1, startTime: now, endTime: now, failureReason: 'Existing singleton company profile preserved.' });
    const documentedSkips = {
      teams: 'No team master or UI create route exists.', equipmentCategories: 'No category master create UI exists.', equipmentTypes: 'No equipment type create UI exists.',
      meterReadings: 'No meter/runtime reading UI exists.', notifications: 'Notifications are workflow-generated; no create UI exists.', inventory: 'Inventory is included in spareParts.',
    };
    const report = { generatedAt: now, auditType: 'Authenticated persisted-count audit', baseUrl: BASE_URL, runPrefix: PREFIX, recordCount: TARGET, creationMethod: 'Playwright UI forms; authenticated frontend APIs used for audit only.', noDirectDatabaseInsert: true, modules, documentedSkips };
    fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
    const headers = ['module','requestedCount','successCount','failedCount','skippedCount','startTime','endTime','failureReason'];
    fs.writeFileSync(CSV_PATH, `${headers.join(',')}\n${modules.map((r) => headers.map((h) => csv(r[h])).join(',')).join('\n')}\n`);
    console.log(JSON.stringify(counts));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
