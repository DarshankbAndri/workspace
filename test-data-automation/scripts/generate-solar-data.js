/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const data = require('../fixtures/solar-data');
const moduleConfig = require('../config/modules.json');
const generationConfig = require('../config/generation-counts.json');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = (process.env.CMMS_BASE_URL || 'http://localhost:6200').replace(/\/$/, '');
const USERNAME = process.env.CMMS_USERNAME || 'superadmin';
const PASSWORD = process.env.CMMS_PASSWORD||'andritz';
const MAX_RECORD_COUNT = 200;
const globalCountOverride = process.env.RECORD_COUNT === undefined ? null : parseCount(process.env.RECORD_COUNT, 'RECORD_COUNT');
const PREFIX = (process.env.RUN_PREFIX || 'SOLAR-DEMO').replace(/[^A-Za-z0-9-]/g, '-').toUpperCase();
const HEADLESS = process.env.HEADLESS !== 'false';
const enabledModules = new Set((process.env.MODULES || '').split(',').map((v) => v.trim()).filter(Boolean));
const REPORT_JSON = path.join(ROOT, 'reports', 'data-creation-report.json');
const REPORT_CSV = path.join(ROOT, 'reports', 'data-creation-report.csv');
const SCREENSHOT_DIR = path.join(ROOT, 'screenshots');
const results = [];
const created = { sites: [], employees: [], vendors: [], equipment: [], spares: [], requests: [], assignments: [] };
const INSTALLED_BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

if (!PASSWORD) {
  console.error('CMMS_PASSWORD is required. Copy .env.example to .env or set it in the environment.');
  process.exit(2);
}

fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function parseCount(value, name) {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0 || count > MAX_RECORD_COUNT) {
    throw new Error(`${name} must be a whole number between 0 and ${MAX_RECORD_COUNT}.`);
  }
  return count;
}

function countFor(module) {
  if (globalCountOverride !== null) return globalCountOverride;
  const configured = generationConfig.counts?.[module] ?? generationConfig.defaultCount ?? 0;
  return parseCount(configured, `generation-counts.json counts.${module}`);
}

const selected = (name) => (enabledModules.size === 0 || enabledModules.has(name)) && countFor(name) > 0;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const normalize = (payload) => (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload ? payload.data : payload);
const arrayOf = (payload) => {
  const value = normalize(payload);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};
const installedBrowser = () => process.env.BROWSER_EXECUTABLE_PATH || INSTALLED_BROWSER_CANDIDATES.find((candidate) => fs.existsSync(candidate));

function startResult(module, requestedCount = countFor(module)) {
  return { module, requestedCount, successCount: 0, failedCount: 0, skippedCount: 0, startTime: new Date().toISOString(), endTime: null, failureReason: '', failures: [] };
}

function finishResult(result) {
  result.endTime = new Date().toISOString();
  result.failureReason = [...new Set(result.failures.map((item) => item.reason))].slice(0, 10).join(' | ');
  results.push(result);
  writeReports();
  console.log(`${result.module}: ${result.successCount} created, ${result.skippedCount} skipped, ${result.failedCount} failed`);
}

function writeReports(extra = {}) {
  const document = {
    generatedAt: new Date().toISOString(), baseUrl: BASE_URL, runPrefix: PREFIX,
    defaultRecordCount: generationConfig.defaultCount, configuredCounts: generationConfig.counts,
    globalRecordCountOverride: globalCountOverride,
    creationMethod: 'Playwright UI forms on the running frontend; authenticated frontend APIs used only for discovery and verification.',
    noDirectDatabaseInsert: true, modules: results, documentedSkips: moduleConfig.documentedSkips, ...extra,
  };
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(document, null, 2)}\n`);
  const headers = ['module', 'requestedCount', 'successCount', 'failedCount', 'skippedCount', 'startTime', 'endTime', 'failureReason'];
  const rows = [headers.join(','), ...results.map((r) => headers.map((h) => csvCell(r[h])).join(','))];
  fs.writeFileSync(REPORT_CSV, `${rows.join('\n')}\n`);
}

async function captureFailure(page, result, index, error) {
  const reason = error?.message || String(error);
  result.failedCount += 1;
  const file = path.join(SCREENSHOT_DIR, `${result.module}-${String(index + 1).padStart(3, '0')}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => {});
  result.failures.push({ index: index + 1, reason, screenshot: path.relative(ROOT, file).replace(/\\/g, '/') });
  console.warn(`${result.module} ${index + 1} failed: ${reason}`);
}

async function api(page, endpoint, options = {}) {
  return page.evaluate(async ({ endpoint: target, options: requestOptions }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api${target}`, {
      ...requestOptions,
      signal: AbortSignal.timeout(30000),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(requestOptions.headers || {}) },
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(`${response.status} ${payload?.message || response.statusText}`);
    return payload;
  }, { endpoint, options });
}

async function gotoForm(page, route, heading) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByRole('heading', { name: heading, exact: true }).waitFor({ timeout: 20000 });
  if (await page.getByText('Access Denied', { exact: true }).count()) throw new Error(`Permission denied for ${route}`);
}

async function fill(page, label, value) {
  const input = page.getByLabel(label, { exact: false }).first();
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.fill(String(value ?? ''));
}

async function fillExact(page, label, value) {
  const input = page.getByLabel(label, { exact: true }).first();
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.fill(String(value ?? ''));
}

async function fillLast(page, label, value) {
  const input = page.getByLabel(label, { exact: false }).last();
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.fill(String(value ?? ''));
}

async function selectOption(page, label, optionText) {
  const input = page.getByLabel(label, { exact: false }).first();
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.click();
  await input.fill(optionText);
  await page.getByRole('option', { name: optionText, exact: true }).last().click({ timeout: 15000 });
}

async function selectLastOption(page, label, optionText) {
  const input = page.getByRole('combobox', { name: label, exact: false }).last();
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.click(); await input.fill(optionText);
  await page.getByRole('option', { name: optionText, exact: true }).last().click({ timeout: 15000 });
}

async function selectFirst(page, label) {
  const input = page.getByLabel(label, { exact: false }).first();
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.click();
  const option = page.getByRole('option').filter({ hasNotText: /No .*found/i }).first();
  await option.waitFor({ state: 'visible', timeout: 15000 });
  await option.click();
}

async function selectLastFirst(page, label) {
  const input = page.getByRole('combobox', { name: label, exact: false }).last();
  await input.waitFor({ state: 'visible', timeout: 15000 }); await input.click();
  const option = page.getByRole('option').filter({ hasNotText: /No .*found/i }).first();
  await option.waitFor({ state: 'visible', timeout: 15000 }); await option.click();
}

async function selectRowOption(page, row, inputIndex, optionText) {
  const input = row.getByRole('combobox').nth(inputIndex);
  await input.click();
  await input.fill(optionText);
  await page.getByRole('option', { name: optionText, exact: true }).last().click({ timeout: 15000 });
}

async function submit(page, endpointPart, action = /^Save$/) {
  const responsePromise = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().includes(endpointPart), { timeout: 30000 });
  await page.getByRole('button', { name: action }).click();
  const response = await responsePromise;
  const body = await response.json().catch(() => null);
  if (!response.ok()) throw new Error(`${response.status()} ${normalize(body)?.message || body?.message || 'Save failed'}`);
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  return normalize(body);
}

async function runRecords(page, module, existingKeys, buildKey, createOne, requestedCount = countFor(module)) {
  if (!selected(module)) return;
  const result = startResult(module, requestedCount);
  for (let index = 0; index < requestedCount; index += 1) {
    const key = buildKey(index);
    if (existingKeys.has(key)) { result.skippedCount += 1; continue; }
    try {
      const value = await createOne(index);
      result.successCount += 1;
      existingKeys.add(key);
      if (value) created[module]?.push(value);
    } catch (error) {
      if (/409|already exists|duplicate|already attached/i.test(error.message)) { result.skippedCount += 1; existingKeys.add(key); }
      else await captureFailure(page, result, index, error);
    }
  }
  finishResult(result);
}

async function login(page) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await fill(page, 'Username', USERNAME); await fill(page, 'Password', PASSWORD);
      await page.getByRole('button', { name: /^(Login|Sign in)$/i }).click();
      await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20000 });
      lastError = null; break;
    } catch (error) {
      const visibleError = await page.locator('[role="alert"]').first().textContent().catch(() => '');
      lastError = new Error(`Login attempt ${attempt} failed${visibleError ? `: ${visibleError}` : `: ${error.message}`}`);
      await sleep(1500 * attempt);
    }
  }
  if (lastError) throw lastError;
  const access = await page.evaluate(() => ({
    roles: JSON.parse(localStorage.getItem('roles') || '[]'),
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }));
  if (!access.roles.includes('SUPER_ADMIN')) console.warn('Login user is not SUPER_ADMIN; missing permissions will be reported per module.');
  return access;
}

async function company(page) {
  if (!selected('company')) return;
  const result = startResult('company', 1);
  await page.goto(`${BASE_URL}/admin/company`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await api(page, '/company/current').catch(() => null);
  result.skippedCount = 1;
  result.failures.push({ reason: moduleConfig.documentedSkips.company });
  finishResult(result);
}

async function sites(page) {
  const rows = arrayOf(await api(page, '/hr/sites'));
  const existing = new Set(rows.map((r) => r.siteCode));
  await runRecords(page, 'sites', existing, (i) => data.site(i, PREFIX).siteCode, async (i) => {
    const item = data.site(i, PREFIX); await gotoForm(page, '/hr/sites/new', 'Add Site');
    for (const [label, key] of [['Site Code','siteCode'],['Site Name','siteName'],['Organization Name','organizationName'],['Site Type','siteType'],['Address Line 1','addressLine1'],['Address Line 2','addressLine2'],['City','city'],['State','state'],['Country','country'],['Pincode','pincode'],['Contact Person','contactPerson'],['Contact Mobile','contactMobile'],['Contact Email','contactEmail'],['Latitude','latitude'],['Longitude','longitude']]) await fill(page, label, item[key]);
    return { ...item, ...(await submit(page, '/hr/sites')) };
  });
}

async function roles(page) {
  const rows = arrayOf(await api(page, '/admin/roles'));
  const existing = new Set(rows.map((r) => r.roleCode));
  await runRecords(page, 'roles', existing, (i) => `${PREFIX}-ROLE-${data.pad(i + 1)}`, async (i) => {
    const code = `${PREFIX}-ROLE-${data.pad(i + 1)}`; const role = data.roles[i % data.roles.length];
    await gotoForm(page, '/admin/roles/new', 'Add Role'); await fill(page, 'Role Code', code);
    await fill(page, 'Role Name', `${role} - Solar Block ${data.pad(Math.floor(i / data.roles.length) + 1, 2)}`);
    await fill(page, 'Description', `Operational ${role.toLowerCase()} role for utility-scale solar plant block activities.`);
    return submit(page, '/admin/roles');
  });
}

async function employees(page) {
  const siteRows = arrayOf(await api(page, '/hr/sites')); const siteByCode = new Map(siteRows.map((r) => [r.siteCode, r]));
  const rows = arrayOf(await api(page, '/hr/employees')); const existing = new Set(rows.map((r) => r.employeeCode));
  await runRecords(page, 'employees', existing, (i) => data.employee(i, PREFIX).employeeCode, async (i) => {
    const item = data.employee(i, PREFIX); const siteItem = data.site(i, PREFIX); const site = siteByCode.get(siteItem.siteCode) || siteRows[i % siteRows.length];
    if (!site) throw new Error('No active site is available for employee assignment.');
    await gotoForm(page, '/hr/employees/new', 'Add Employee');
    for (const [label, key] of [['Employee Code','employeeCode'],['First Name','firstName'],['Last Name','lastName'],['Mobile Number','mobileNumber'],['Email','email'],['Date of Birth','dateOfBirth'],['Date of Joining','dateOfJoining'],['Designation','designation'],['Department','department']]) await fill(page, label, item[key]);
    const row = page.locator('tbody tr').first(); await selectRowOption(page, row, 0, site.siteName); await row.locator('td').nth(1).locator('input').fill(item.siteRole);
    return { ...item, siteId: site.id, ...(await submit(page, '/hr/employees')) };
  });
}

async function vendors(page) {
  const siteRows = arrayOf(await api(page, '/hr/sites')); const siteByCode = new Map(siteRows.map((r) => [r.siteCode, r]));
  const rows = arrayOf(await api(page, '/vendors')); const existing = new Set(rows.map((r) => r.vendorCode));
  await runRecords(page, 'vendors', existing, (i) => data.vendor(i, PREFIX).vendorCode, async (i) => {
    const item = data.vendor(i, PREFIX); const wanted = data.site(i, PREFIX); const site = siteByCode.get(wanted.siteCode) || siteRows[i % siteRows.length];
    await gotoForm(page, '/vendors/new', 'Add Vendor');
    for (const [label,key] of [['Vendor Code','vendorCode'],['Vendor Name','vendorName'],['Contact Person','contactPerson'],['Email','email'],['Phone','phone'],['Service Category','serviceCategory'],['Address','address']]) await fill(page,label,item[key]);
    await selectRowOption(page, page.locator('tbody tr').first(), 0, `${site.siteName} (${site.siteCode})`);
    return { ...item, siteId: site.id, ...(await submit(page, '/vendors')) };
  });
}

async function equipment(page) {
  const siteRows = arrayOf(await api(page, '/hr/sites')); const siteByCode = new Map(siteRows.map((r) => [r.siteCode, r]));
  const rows = arrayOf(await api(page, '/equipment')); const existing = new Set(rows.map((r) => r.equipmentCode));
  await runRecords(page, 'equipment', existing, (i) => data.equipment(i, PREFIX).equipmentCode, async (i) => {
    const item = data.equipment(i, PREFIX); const wanted = data.site(i, PREFIX); const site = siteByCode.get(wanted.siteCode) || siteRows[i % siteRows.length];
    await gotoForm(page, '/equipment/new', 'Add Equipment');
    for (const [label,key] of [['Equipment Code','equipmentCode'],['Equipment Name','equipmentName'],['Category','category'],['Location','location'],['Manufacturer','manufacturer'],['Model Number','modelNumber'],['Serial Number','serialNumber'],['Installation Date','installationDate'],['Commissioning Date','commissioningDate'],['Warranty Expiry','warrantyExpiryDate'],['Asset Number','assetNumber'],['Purchase Cost','purchaseCost'],['Cost Center','costCenter']]) await fill(page,label,item[key]);
    await selectOption(page, 'Site', `${site.siteName} (${site.siteCode})`); await selectOption(page, 'Criticality', item.criticality[0] + item.criticality.slice(1).toLowerCase());
    return { ...item, siteId: site.id, ...(await submit(page, '/equipment')) };
  });
}

async function spareParts(page) {
  const siteRows = arrayOf(await api(page, '/hr/sites')); const siteByCode = new Map(siteRows.map((r) => [r.siteCode, r]));
  const search = await api(page, '/spare-parts/search', { method: 'POST', body: JSON.stringify({ searchCriteriaList: [], dataOption: 'all', pagination: { status: 'OFF' } }) }).catch(() => []);
  const existing = new Set(arrayOf(search).map((r) => r.partCode));
  await runRecords(page, 'spareParts', existing, (i) => data.spare(i, PREFIX).partCode, async (i) => {
    const item = data.spare(i, PREFIX); const wanted = data.site(i, PREFIX); const site = siteByCode.get(wanted.siteCode) || siteRows[i % siteRows.length];
    await gotoForm(page, '/inventory/spare-parts/new', 'Add Spare Part');
    for (const [label,key] of [['Part Code','partCode'],['Part Name','partName'],['Unit','unit'],['Category','category'],['Opening Stock','currentStock'],['Minimum Stock','minimumStock'],['Unit Cost','unitCost'],['Storage Location','storageLocation'],['Description','description']]) await fill(page,label,item[key]);
    await selectOption(page, 'Site', `${site.siteName} (${site.siteCode})`);
    return { ...item, siteId: site.id, ...(await submit(page, '/spare-parts')) };
  });
}

async function pmSchedules(page) {
  const sites = arrayOf(await api(page, '/hr/sites')); const equipments = arrayOf(await api(page, '/equipment'));
  const existingRows = arrayOf(await api(page, '/preventive-maintenance/schedules')); const existing = new Set(existingRows.map((r) => `${r.equipmentId}|${r.title}`));
  const ownEquipment = equipments.filter((e) => e.equipmentCode?.startsWith(PREFIX));
  await runRecords(page, 'preventiveMaintenance', existing, (i) => `${ownEquipment[i % ownEquipment.length]?.id}|${data.pmTasks[i % data.pmTasks.length][0]} - ${data.pad(i + 1)}`, async (i) => {
    const eq = ownEquipment[i % ownEquipment.length]; if (!eq) throw new Error('No generated equipment available.'); const site = sites.find((s) => String(s.id) === String(eq.siteId)); const task = data.pmTasks[i % data.pmTasks.length];
    const title = `${task[0]} - ${data.pad(i + 1)}`; await gotoForm(page, '/maintenance/preventive/new', 'Add PM Schedule');
    await selectOption(page, 'Site', `${site.siteName} (${site.siteCode})`); await selectOption(page, 'Equipment', `${eq.equipmentCode} - ${eq.equipmentName}`);
    await fill(page, 'Assigned To', 'Solar O&M Preventive Maintenance Team'); await fill(page, 'PM Task', title); await selectOption(page, 'Frequency', ['DAILY','WEEKLY','MONTHLY','QUARTERLY','YEARLY'][i % 5]);
    await fill(page, 'Start Date', data.isoDate(i % 20)); await fill(page, 'Next Due Date', data.isoDate(7 + (i % 90))); await fill(page, 'Description', task[1]);
    return { equipmentId: eq.id, title, ...(await submit(page, '/preventive-maintenance/schedules')) };
  });
}

async function maintenanceRequests(page) {
  const sites = arrayOf(await api(page, '/hr/sites')); const equipments = arrayOf(await api(page, '/equipment')).filter((e) => e.equipmentCode?.startsWith(PREFIX));
  const rows = arrayOf(await api(page, '/maintenance/requests')); const existing = new Set(rows.map((r) => r.title));
  await runRecords(page, 'maintenanceRequests', existing, (i) => `${data.issues[i % data.issues.length][0]} - ${PREFIX}-${data.pad(i + 1)}`, async (i) => {
    const eq = equipments[i % equipments.length]; const site = sites.find((s) => String(s.id) === String(eq.siteId)); const issue = data.issues[i % data.issues.length]; const title = `${issue[0]} - ${PREFIX}-${data.pad(i + 1)}`;
    await gotoForm(page, '/maintenance/requests/new', 'Add Request'); await selectOption(page, 'Site', `${site.siteName} (${site.siteCode})`); await selectOption(page, 'Equipment', `${eq.equipmentCode} - ${eq.equipmentName}`);
    await fill(page, 'Title', title); await fill(page, 'Reported By', 'Solar Plant Control Room'); await selectOption(page, 'Type', ['Breakdown','Inspection','Calibration'][i % 3]); await selectOption(page, 'Priority', ['Low','Medium','High','Urgent'][i % 4]);
    await fill(page, 'Requested Date', data.isoDate(-(i % 45))); await fill(page, 'Target Completion', data.isoDate(1 + (i % 14))); await fill(page, 'Description', issue[1]);
    return { title, siteId: site.id, equipmentId: eq.id, ...(await submit(page, '/maintenance/requests')) };
  });
}

async function assignments(page) {
  const requests = arrayOf(await api(page, '/maintenance/requests')).filter((r) => r.title?.includes(PREFIX));
  const rows = arrayOf(await api(page, '/maintenance/assignments')); const existing = new Set(rows.map((r) => String(r.requestId)));
  await runRecords(page, 'assignments', existing, (i) => String(requests[i % requests.length]?.id), async (i) => {
    const request = requests[i % requests.length]; if (!request) throw new Error('No generated maintenance request available.');
    await gotoForm(page, '/maintenance/assignments/new', 'Add Assignment');
    const targetSite = arrayOf(await api(page, '/hr/sites')).find((s) => String(s.id) === String(request.siteId));
    if (targetSite) await selectOption(page, 'Site', `${targetSite.siteName} (${targetSite.siteCode})`);
    await selectFirst(page, 'Request'); await selectFirst(page, 'Vendor'); await fillLast(page, 'Assigned To', 'Solar O&M Field Technician');
    await fill(page, 'Assigned Date', data.isoDate(-(i % 20))); await fill(page, 'Planned Start', data.isoDate(i % 5)); await fill(page, 'Planned End', data.isoDate(7 + (i % 5))); await fill(page, 'Estimated Cost', 12000 + (i % 20) * 1750); await fill(page, 'Remarks', 'Solar plant corrective maintenance assignment with LOTO and permit-to-work requirements.');
    return { requestId: request.id, ...(await submit(page, '/maintenance/assignments')) };
  });
}

async function workLogs(page) {
  if (!selected('workLogs')) return;
  const generatedRequestIds = new Set(arrayOf(await api(page, '/maintenance/requests')).filter((row) => row.title?.includes(PREFIX)).map((row) => String(row.id)));
  const assignments = arrayOf(await api(page, '/maintenance/assignments')).filter((row) => generatedRequestIds.has(String(row.requestId)) || created.assignments.some((item) => String(item.id) === String(row.id)));
  const existing = new Set();
  for (const assignment of assignments) {
    const logs = arrayOf(await api(page, `/maintenance/assignments/${assignment.id}/work-logs`).catch(() => []));
    if (logs.some((log) => log.workNotes?.includes(PREFIX))) existing.add(String(assignment.id));
  }
  await runRecords(page, 'workLogs', existing, (i) => String(assignments[i % assignments.length]?.id), async (i) => {
    const assignment = assignments[i % assignments.length]; if (!assignment) throw new Error('No generated assignment available.');
    await gotoForm(page, `/maintenance/assignments/${assignment.id}/edit`, 'Edit Assignment');
    await page.getByRole('tab', { name: /Work Logs/ }).click(); await selectLastFirst(page, 'Technician');
    await fill(page, 'Start Time', data.localDateTime(5 + (i % 48))); await fill(page, 'End Time', data.localDateTime(2 + (i % 3)));
    await selectLastOption(page, 'Status', 'COMPLETED'); await fill(page, 'Work Notes', `${PREFIX}: Field work completed under approved permit and LOTO.`);
    await fill(page, 'Issue Found', data.issues[i % data.issues.length][1]); await fill(page, 'Action Taken', 'Connections inspected and tightened, affected component serviced, alarms cleared, and operation verified from SCADA.');
    return submit(page, `/maintenance/assignments/${assignment.id}/work-logs`, /^Add Log$/);
  });
}

async function spareRequests(page) {
  if (!selected('spareRequests')) return;
  const generatedRequestIds = new Set(arrayOf(await api(page, '/maintenance/requests')).filter((row) => row.title?.includes(PREFIX)).map((row) => String(row.id)));
  const assignments = arrayOf(await api(page, '/maintenance/assignments')).filter((row) => generatedRequestIds.has(String(row.requestId)) || created.assignments.some((item) => String(item.id) === String(row.id)));
  const existing = new Set();
  for (const assignment of assignments) {
    const spares = arrayOf(await api(page, `/maintenance/assignments/${assignment.id}/spares`).catch(() => []));
    if (spares.length > 0) existing.add(String(assignment.id));
  }
  await runRecords(page, 'spareRequests', existing, (i) => String(assignments[i % assignments.length]?.id), async (i) => {
    const assignment = assignments[i % assignments.length]; if (!assignment) throw new Error('No generated assignment available.');
    await gotoForm(page, `/maintenance/assignments/${assignment.id}/edit`, 'Edit Assignment');
    await page.getByRole('tab', { name: /Spare Parts/ }).click(); await selectFirst(page, 'Spare Part');
    await fill(page, 'Quantity', 1 + (i % 3)); await fill(page, 'Remarks', `${PREFIX}: Required for safe restoration and plant availability.`);
    return submit(page, `/maintenance/assignments/${assignment.id}/spares`, /^Request Spare$/);
  });
}

async function purchaseRequests(page) {
  if (!selected('purchaseRequests')) return;
  const permissions = await page.evaluate(() => JSON.parse(localStorage.getItem('permissions') || '[]'));
  if (!permissions.includes('REORDER_CREATE')) {
    const result = startResult('purchaseRequests'); result.skippedCount = countFor('purchaseRequests');
    result.failures.push({ reason: 'Login user is missing REORDER_CREATE; the UI reorder action is not available and security was not bypassed.' }); finishResult(result); return;
  }
  const generatedSites = arrayOf(await api(page, '/hr/sites')).filter((row) => row.siteCode?.startsWith(PREFIX));
  const spareGroups = [];
  for (const site of generatedSites) spareGroups.push(...arrayOf(await api(page, `/spare-parts/site/${site.id}`).catch(() => [])));
  const spares = spareGroups.filter((row) => row.partCode?.startsWith(PREFIX));
  const generatedStockIds = new Set(spares.map((row) => String(row.id)));
  const reorders = arrayOf(await api(page, '/spare-part-reorders')).filter((row) => generatedStockIds.has(String(row.stockId)));
  // A preferred vendor can make a stock item ineligible when that vendor is not
  // assigned to the stock's site. Reuse stock items that the UI/backend have
  // already accepted; multiple reorder requests per stock are supported.
  const acceptedStockIds = [...new Set(reorders.map((row) => String(row.stockId)))];
  const acceptedSpares = acceptedStockIds.map((id) => spares.find((row) => String(row.id) === id)).filter(Boolean);
  const candidates = acceptedSpares.length > 0 ? acceptedSpares : spares;
  const existing = new Set(Array.from({ length: Math.min(reorders.length, countFor('purchaseRequests')) }, (_, index) => String(index)));
  await page.goto(`${BASE_URL}/inventory/spare-parts`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Spare Parts Inventory' }).waitFor();
  await runRecords(page, 'purchaseRequests', existing, (i) => String(i), async (i) => {
    const spare = candidates[i % candidates.length]; if (!spare) throw new Error('No generated spare part available.');
    await fill(page, 'Search', spare.partCode); await sleep(900);
    await page.locator('.MuiDataGrid-overlay').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await page.locator('.MuiDataGrid-virtualScroller').evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    await page.getByRole('button', { name: 'Create reorder' }).first().waitFor({ state: 'visible', timeout: 20000 });
    await page.getByRole('button', { name: 'Create reorder' }).first().click(); await page.getByRole('heading', { name: 'Create Reorder Request' }).waitFor();
    await fill(page, 'Requested Quantity', Math.max(5, Number(spare.minimumStock || 5) * 2)); await fill(page, 'Estimated Unit Cost', spare.unitCost || 1000); await fill(page, 'Expected Date', data.isoDate(14 + (i % 30)));
    await fill(page, 'Remarks', `${PREFIX}: Purchase request ${data.pad(i + 1)} for minimum-stock replenishment and planned solar plant maintenance.`);
    const saved = await submit(page, '/spare-part-reorders', /^Create$/);
    await page.getByRole('heading', { name: 'Create Reorder Request' }).waitFor({ state: 'hidden', timeout: 10000 });
    return saved;
  });
}

async function downtime(page) {
  const sites = arrayOf(await api(page, '/hr/sites')); const equipments = arrayOf(await api(page, '/equipment')).filter((e) => e.equipmentCode?.startsWith(PREFIX));
  const rows = arrayOf(await api(page, '/maintenance/downtime')); const existing = new Set(rows.filter((r) => r.reason?.includes(PREFIX)).map((r) => r.reason));
  await runRecords(page, 'downtime', existing, (i) => `${PREFIX}: ${data.downtimeReasons[i % data.downtimeReasons.length]} ${data.pad(i + 1)}`, async (i) => {
    const eq = equipments[i % equipments.length]; const site = sites.find((s) => String(s.id) === String(eq.siteId)); const reason = `${PREFIX}: ${data.downtimeReasons[i % data.downtimeReasons.length]} ${data.pad(i + 1)}`;
    await gotoForm(page, '/maintenance/downtime/new', 'Add Downtime'); await selectOption(page, 'Site', `${site.siteName} (${site.siteCode})`); await selectOption(page, 'Equipment', `${eq.equipmentCode} - ${eq.equipmentName}`);
    await fill(page, 'Reason', reason); await fill(page, 'Start Time', data.localDateTime(6 + (i % 120))); await fill(page, 'End Time', data.localDateTime(2 + (i % 5))); await fill(page, 'Remarks', 'Recorded from the plant event log and reviewed by the shift engineer.');
    return submit(page, '/maintenance/downtime');
  });
}

async function documentUnsupported() {
  for (const [module, reason] of Object.entries(moduleConfig.documentedSkips)) {
    if (module === 'company' || module === 'inventory') continue;
    const result = startResult(module, 0); result.skippedCount = 1; result.failures.push({ reason }); finishResult(result);
  }
}

async function validate(page) {
  if (!selected('validation')) return;
  const result = startResult('validation', 7);
  const routes = ['/hr/sites', '/hr/employees', '/vendors', '/equipment', '/inventory/spare-parts', '/maintenance/preventive', '/maintenance/requests'];
  for (let i = 0; i < routes.length; i += 1) {
    try { await page.goto(`${BASE_URL}${routes[i]}`, { waitUntil: 'domcontentloaded', timeout: 30000 }); await page.locator('body').waitFor({ state: 'visible' }); if (await page.getByText('Access Denied', { exact: true }).count()) throw new Error('Access denied'); result.successCount += 1; }
    catch (error) { await captureFailure(page, result, i, error); }
  }
  finishResult(result);
}

(async () => {
  let browser;
  try {
    const launch = { headless: HEADLESS };
    const executablePath = installedBrowser();
    if (executablePath) launch.executablePath = executablePath;
    browser = await chromium.launch(launch);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true });
    const page = await context.newPage(); page.setDefaultTimeout(20000);
    const access = await login(page);
    await company(page); await sites(page); await roles(page); await employees(page); await vendors(page); await equipment(page); await spareParts(page);
    await pmSchedules(page); await maintenanceRequests(page); await assignments(page); await workLogs(page); await spareRequests(page); await downtime(page); await purchaseRequests(page); await validate(page); await documentUnsupported();
    writeReports({ loginUser: access.user?.username || USERNAME, roles: access.roles, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error(error.stack || error.message); writeReports({ fatalError: error.message, completedAt: new Date().toISOString() }); process.exitCode = 1;
  } finally { await browser?.close(); }
})();
