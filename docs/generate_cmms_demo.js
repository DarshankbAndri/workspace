const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND_URL = process.env.CMMS_FRONTEND_URL || 'http://127.0.0.1:3500';
const API_URL = process.env.CMMS_API_URL || 'http://localhost:4200/api';
const USERNAME = process.env.CMMS_DEMO_USER || 'cmms.superadmin';
const PASSWORD = process.env.CMMS_DEMO_PASSWORD || 'andritz';
const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(ROOT, 'docs', 'screenshots');
const PRESENTATION_DIR = path.join(ROOT, 'docs', 'presentation');
const PRESENTATION_PATH = process.env.CMMS_PPT_OUTPUT || path.join(PRESENTATION_DIR, 'CMMS_Application_Demo.pptx');
const REPORT_PATH = path.join(PRESENTATION_DIR, 'CMMS_Application_Demo_Report.json');
let SHAPE = null;

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const COLORS = {
  blue: '003DA5',
  blueDark: '002C7A',
  yellow: 'FFC107',
  ink: '1F2937',
  muted: '667085',
  light: 'F5F7FB',
  white: 'FFFFFF',
  line: 'D0D5DD',
  green: '12B76A',
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
  ensureDir(dir);
  for (const entry of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function screenshotPath(index, name) {
  return path.join(SCREENSHOT_DIR, `${String(index).padStart(2, '0')}-${slugify(name)}.png`);
}

function discoverRoutes() {
  const appPath = path.join(ROOT, 'cmms_front_end', 'src', 'App.jsx');
  const source = fs.readFileSync(appPath, 'utf8');
  const routes = [];
  const routeRegex = /<Route\s+path="([^"]+)"/g;
  let match;
  while ((match = routeRegex.exec(source))) {
    routes.push(match[1]);
  }
  return [...new Set(routes)];
}

async function apiRequest(endpoint, options = {}, token = null) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${endpoint} failed with ${response.status}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function getDemoAccess() {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
}

function firstRow(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (Array.isArray(payload.data)) return payload.data[0] || null;
  if (Array.isArray(payload.content)) return payload.content[0] || null;
  return null;
}

function searchPayload() {
  return {
    searchCriteriaList: [],
    dataOption: 'all',
    pagination: {
      status: 'ON',
      recordsPerPage: 10,
      pageNumber: 0,
      pageSize: 0,
      sortBy: null,
      sortMode: null,
    },
  };
}

async function resolveIds(token) {
  const ids = {};
  const safe = async (key, fn) => {
    try {
      const row = firstRow(await fn());
      ids[key] = row?.id || row?.roleId || row?.siteId || row?.employeeId || null;
    } catch (error) {
      ids[key] = null;
    }
  };

  await safe('equipment', () => apiRequest('/equipment', {}, token));
  await safe('request', () => apiRequest('/maintenance/requests', {}, token));
  await safe('assignment', () => apiRequest('/maintenance/assignments', {}, token));
  await safe('downtime', () => apiRequest('/maintenance/downtime', {}, token));
  await safe('pm', () => apiRequest('/preventive-maintenance/schedules', {}, token));
  await safe('role', () => apiRequest('/admin/roles', {}, token));
  await safe('sparePart', () => apiRequest('/spare-parts/search', { method: 'POST', body: JSON.stringify(searchPayload()) }, token));
  await safe('reorder', () => apiRequest('/spare-part-reorders', {}, token));
  return ids;
}

async function waitForUi(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.locator('body').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
}

async function capture(page, name, route, options = {}) {
  const filePath = screenshotPath(options.index, name);
  const url = `${FRONTEND_URL}${route}`;
  let status = 'captured';
  let error = null;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForUi(page);
    if (options.action) {
      await options.action(page);
      await waitForUi(page);
    }
    await page.screenshot({ path: filePath, fullPage: false });
  } catch (err) {
    status = 'failed';
    error = err.message;
    await page.screenshot({ path: filePath, fullPage: false }).catch(() => {});
  }
  return { name, route, filePath, status, error, note: options.note || null };
}

async function clickFirst(page, selector) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) > 0) {
    await locator.click({ timeout: 5000 });
    return true;
  }
  return false;
}

function moduleSlide(title, moduleName, route, description, keyFields, features, benefits, options = {}) {
  return {
    type: 'module',
    title,
    moduleName,
    route,
    description,
    keyFields,
    features,
    benefits,
    ...options,
  };
}

function buildSlidePlan(ids) {
  const equipmentId = ids.equipment || 1;
  const requestId = ids.request || 1;
  const assignmentId = ids.assignment || 1;
  const downtimeId = ids.downtime || 1;
  const pmId = ids.pm || 1;
  const roleId = ids.role || 1;
  const slides = [
    { type: 'title', title: 'CMMS Application', route: '/dashboard' },
    { type: 'overview', title: 'Application Overview', route: '/dashboard' },
    { type: 'toc', title: 'Table of Contents', route: '/dashboard' },
    { type: 'navigation', title: 'Application Navigation Flow', route: '/dashboard' },

    moduleSlide('Company Creation Page', 'Company Module', '/admin/company', 'Maintain the company master profile used throughout the application.', ['Company code', 'Company name', 'Email', 'Phone', 'Address', 'Status'], ['Create or update company profile', 'Upload and preview company logo', 'Use company data in navigation'], ['Consistent company identity', 'Centralized master information']),
    moduleSlide('Company List Page', 'Company Module', '/admin/company', 'No standalone company list route was discovered; the application exposes company configuration as a single profile page.', ['Current company profile', 'Logo preview', 'Status'], ['Single active company profile', 'Editable master data'], ['Simple governance for organization-level settings'], { substitution: 'Used Company Master because no company list route exists.' }),

    moduleSlide('Site Creation', 'Site Module', '/hr/sites/new', 'Register operating locations and service centers.', ['Site code', 'Site name', 'Type', 'Address', 'Contact', 'Geo location'], ['Create site master records', 'Capture address and contact data', 'Support active/inactive status'], ['Clear site ownership', 'Site-based maintenance visibility']),
    moduleSlide('Site List', 'Site Module', '/hr/sites', 'Browse and filter all configured sites.', ['Site code', 'Name', 'City', 'State', 'Status'], ['Search site records', 'Edit site details', 'Manage operational status'], ['Faster site administration', 'Cleaner location hierarchy']),

    moduleSlide('Employee Creation', 'Employee Module', '/hr/employees/new', 'Create employee master records for operations and maintenance teams.', ['Employee code', 'Name', 'Mobile', 'Email', 'Designation', 'Department'], ['Maintain employee identity', 'Track department/designation', 'Enable site and user-role assignment'], ['Reliable workforce directory', 'Improved accountability']),
    moduleSlide('Employee List', 'Employee Module', '/hr/employees', 'Review employee records and status.', ['Employee code', 'Name', 'Department', 'Designation', 'Status'], ['Search employee data', 'Edit employee profile', 'Deactivate records'], ['Central HR-maintenance alignment', 'Cleaner technician assignment data']),

    moduleSlide('Role Creation', 'Roles & Permissions', '/admin/roles/new', 'Define application roles for access control.', ['Role code', 'Role name', 'Description', 'Status', 'Permissions'], ['Create reusable roles', 'Map permissions by module', 'Control page access'], ['Stronger governance', 'Consistent role-based access']),
    moduleSlide('Permission Mapping', 'Roles & Permissions', '/admin/user-roles', 'Assign user roles and site-level access.', ['User', 'Role', 'Site', 'Status'], ['Map users to roles', 'Limit access by site', 'Update role assignments'], ['Preserved authentication flow', 'Least-privilege access control']),
    moduleSlide('Role List', 'Roles & Permissions', '/admin/roles', 'Review roles and permission counts.', ['Role code', 'Role name', 'Status', 'Permission count'], ['Search roles', 'View role permissions', 'Edit or inactivate roles'], ['Transparent authorization model', 'Simplified admin review']),

    moduleSlide('Vendor Creation', 'Vendor Module', '/vendors/new', 'Register service vendors and contractors.', ['Vendor code', 'Vendor name', 'Contact person', 'Email', 'Phone', 'Category'], ['Maintain vendor master data', 'Enable vendor-site assignment', 'Support active/inactive status'], ['Better vendor control', 'Faster assignment planning']),
    moduleSlide('Vendor List', 'Vendor Module', '/vendors', 'Browse approved vendors and service categories.', ['Vendor code', 'Name', 'Category', 'Contact', 'Status'], ['Search vendors', 'Edit vendor details', 'Deactivate vendors'], ['Centralized contractor records', 'Better sourcing decisions']),

    moduleSlide('Equipment Creation', 'Equipment Module', '/equipment/new', 'Register assets and link them to sites.', ['Equipment code', 'Name', 'Site', 'Category', 'Manufacturer', 'Criticality'], ['Create asset records', 'Track warranty and status', 'Link to site ownership'], ['Centralized asset management', 'Improved maintenance planning']),
    moduleSlide('Equipment List', 'Equipment Module', '/equipment', 'Browse plant assets and operating status.', ['Equipment code', 'Name', 'Site', 'Category', 'Criticality'], ['Filter by site', 'Search assets', 'Edit equipment'], ['Fast asset lookup', 'Better visibility into critical assets']),
    moduleSlide('Equipment Details', 'Equipment Module', `/equipment/${equipmentId}`, 'View or edit detailed asset master data.', ['Installation date', 'Warranty expiry', 'Serial number', 'Status'], ['Complete asset profile', 'Update technical details', 'Maintain criticality'], ['Accurate maintenance context', 'Better lifecycle tracking']),

    moduleSlide('Request Creation', 'Maintenance Request Module', '/maintenance/requests/new', 'Create corrective, breakdown, inspection, or calibration requests.', ['Site', 'Equipment', 'Title', 'Priority', 'Requested date'], ['Log maintenance demand', 'Classify request type', 'Set target completion'], ['Structured work intake', 'Better prioritization']),
    moduleSlide('Request List', 'Maintenance Request Module', '/maintenance/requests', 'Track open and in-progress maintenance requests.', ['Request number', 'Equipment', 'Site', 'Priority', 'Status'], ['Search requests', 'Filter status', 'Open request details'], ['Improved backlog visibility', 'Faster triage']),
    moduleSlide('Request Details', 'Maintenance Request Module', `/maintenance/requests/${requestId}/view`, 'Review maintenance request details in read-only context.', ['Description', 'Reported by', 'Priority', 'Target date'], ['Read-only review', 'Status visibility', 'Equipment linkage'], ['Clear request context', 'Better handoff to assignments']),

    moduleSlide('Assignment Creation', 'Assignment Module', '/maintenance/assignments/new', 'Assign maintenance work to technicians and vendors.', ['Request', 'Vendor', 'Assigned to', 'Planned dates', 'Cost'], ['Create work assignment', 'Plan start/end dates', 'Estimate cost'], ['Controlled execution planning', 'Vendor accountability']),
    moduleSlide('Assignment List', 'Assignment Module', '/maintenance/assignments', 'Monitor work assignments and execution status.', ['Request', 'Vendor', 'Technician', 'Status', 'Cost'], ['Search assignments', 'Track progress', 'Open details'], ['Improved workload visibility', 'Better field coordination']),
    moduleSlide('Assignment Details', 'Assignment Module', `/maintenance/assignments/${assignmentId}/view`, 'Review assignment details and spare usage workflow.', ['Actual dates', 'Spare requests', 'Status', 'Remarks'], ['Read-only assignment review', 'Spare usage table', 'Execution tracking'], ['Traceable maintenance work', 'Cleaner closeout process']),

    moduleSlide('Downtime Creation', 'Downtime Module', '/maintenance/downtime/new', 'Record equipment downtime events.', ['Equipment', 'Request', 'Start', 'End', 'Reason'], ['Capture planned/unplanned downtime', 'Calculate duration', 'Link to request'], ['Accurate downtime accounting', 'RCA-ready history']),
    moduleSlide('Downtime List', 'Downtime Module', '/maintenance/downtime', 'View downtime events across sites and equipment.', ['Equipment', 'Site', 'Duration', 'Reason', 'Planned'], ['Search downtime', 'Filter records', 'Open details'], ['Operational loss visibility', 'Better maintenance analysis']),
    moduleSlide('Downtime Tracking', 'Downtime Module', `/maintenance/downtime/${downtimeId}/view`, 'Inspect downtime event timing and maintenance context.', ['Start time', 'End time', 'Hours', 'Minutes', 'Remarks'], ['Detailed tracking', 'Request linkage', 'Duration calculation'], ['Improved uptime reporting', 'Better reliability metrics']),

    moduleSlide('PM Schedule Creation', 'Preventive Maintenance Module', '/maintenance/preventive/new', 'Create recurring preventive maintenance schedules.', ['Equipment', 'Frequency', 'Next due date', 'Priority', 'Vendor'], ['Define recurrence', 'Assign vendor/site', 'Set SLA priority'], ['Reduced breakdowns', 'Planned maintenance rhythm']),
    moduleSlide('PM List', 'Preventive Maintenance Module', '/maintenance/preventive', 'Track preventive schedules and due work generation.', ['Equipment', 'Frequency', 'Next due', 'Active', 'Completion %'], ['Filter schedules', 'Generate work orders', 'Monitor PM compliance'], ['Proactive maintenance', 'Higher asset availability']),
    moduleSlide('PM Calendar', 'Preventive Maintenance Module', '/maintenance/preventive', 'No standalone PM calendar route was discovered; PM due dates are represented in the schedule list.', ['Next due date', 'Frequency', 'Priority'], ['Schedule-oriented due view', 'Upcoming maintenance visibility'], ['Calendar-ready PM data', 'Better planning cadence'], { substitution: 'Used PM List because no PM calendar route exists.' }),
    moduleSlide('PM Assignment Flow', 'Preventive Maintenance Module', `/maintenance/preventive/${pmId}/view`, 'Review PM schedule details before generating or assigning work.', ['Schedule', 'Equipment', 'Vendor', 'Due date'], ['Generate work order from PM', 'Connect PM to request flow'], ['Controlled recurring work', 'Lower emergency workload']),

    moduleSlide('Spare Part Creation', 'Spare Parts Module', '/inventory/spare-parts/new', 'Create spare part and site stock records.', ['Part code', 'Part name', 'Site', 'Stock', 'Minimum stock', 'Unit cost'], ['Maintain spare master', 'Set min/max levels', 'Attach vendor/category'], ['Material availability', 'Better repair readiness']),
    moduleSlide('Spare Part List', 'Spare Parts Module', '/inventory/spare-parts', 'Manage site-wise spare stock and actions.', ['Part code', 'Site', 'Available stock', 'Minimum stock', 'Low stock'], ['Search inventory', 'Stock in/adjust/transfer', 'Create reorder'], ['Fast stock visibility', 'Lower maintenance delays']),
    moduleSlide('Stock View', 'Spare Parts Module', '/inventory/spare-parts', 'View current, reserved, and available stock by site.', ['Current stock', 'Reserved stock', 'Available stock', 'Storage location'], ['Site-level stock view', 'Low-stock filter', 'QR label support'], ['Inventory transparency', 'Reduced stockouts']),
    moduleSlide('Stock Transaction History', 'Spare Parts Module', '/inventory/spare-parts', 'Review stock movement history for a selected spare part.', ['Transaction type', 'Quantity', 'Before/after stock', 'Reference'], ['Open transaction history dialog', 'Audit material movements'], ['Traceable inventory activity', 'Stronger stock control'], {
      action: async (page) => {
        const clicked = await clickFirst(page, 'button[aria-label="History"]');
        if (!clicked) throw new Error('No stock history action found on spare parts list.');
      },
    }),

    moduleSlide('Inventory Dashboard', 'Inventory Module', '/inventory/spare-parts', 'No separate inventory dashboard route was discovered; the spare parts inventory page is the operational inventory dashboard.', ['Current stock', 'Reserved stock', 'Low-stock status'], ['Inventory filters', 'Site-level stock', 'Stock actions'], ['Operational stock overview', 'Material planning support'], { substitution: 'Used Spare Parts Inventory because no distinct inventory dashboard route exists.' }),
    moduleSlide('Inventory List', 'Inventory Module', '/inventory/spare-parts', 'List site stock records across all spare parts.', ['Part', 'Site', 'Available', 'Minimum', 'Unit cost'], ['Filter inventory', 'Identify low stock', 'Edit stock master'], ['Cleaner stock administration', 'Faster spare lookup']),
    moduleSlide('Stock Movement', 'Inventory Module', '/inventory/spare-parts', 'Record stock in, adjustment, and transfer movement.', ['Movement type', 'Quantity', 'Unit cost', 'Remarks'], ['Open stock movement dialog', 'Adjust site stock', 'Capture movement remarks'], ['Controlled stock updates', 'Inventory auditability'], {
      action: async (page) => {
        const clicked = await clickFirst(page, 'button[aria-label="Stock in"]');
        if (!clicked) throw new Error('No stock-in action found on inventory list.');
      },
    }),

    moduleSlide('Purchase Request Creation', 'Purchase Request Module', '/inventory/spare-parts', 'Create reorder requests from low or planned stock requirements.', ['Stock item', 'Requested quantity', 'Estimated cost', 'Expected date'], ['Open reorder dialog', 'Create purchase request', 'Link to stock item'], ['Faster replenishment', 'Reduced stockout risk'], {
      action: async (page) => {
        const clicked = await clickFirst(page, 'button[aria-label="Create reorder"]');
        if (!clicked) throw new Error('No reorder action found on spare parts list.');
      },
    }),
    moduleSlide('Purchase Request List', 'Purchase Request Module', '/inventory/reorders', 'Track reorder and purchase requests.', ['Request', 'Part', 'Site', 'Status', 'Requested quantity'], ['View reorder records', 'Receive stock', 'Update purchase status'], ['Purchasing visibility', 'Closed loop stock replenishment']),
    moduleSlide('Purchase Approval Flow', 'Purchase Request Module', '/inventory/spare-approvals', 'Review spare requests before store processing or purchasing.', ['Spare request', 'Manager approval', 'Stock status', 'Decision'], ['Manager review queue', 'Approve/reject request', 'Escalate to purchase'], ['Controlled material release', 'Better approval governance']),

    moduleSlide('Notification Center', 'Notification Module', '/notifications', 'View system notifications generated from workflows.', ['Type', 'Priority', 'Status', 'Reference', 'Created at'], ['In-app notification list', 'Read/archive actions', 'Reference links'], ['Faster user awareness', 'Better exception handling']),
    moduleSlide('Notification Workflow', 'Notification Module', '/admin/notification-settings', 'Configure notification preferences and recipient roles.', ['Email enabled', 'PM reminders', 'Overdue alerts', 'Fallback roles'], ['Adjust notification settings', 'Control reminder windows', 'Define recipients'], ['Timely escalations', 'Configurable communication']),

    moduleSlide('Dashboard Overview', 'Dashboard Module', '/dashboard', 'Executive view of CMMS status and activity.', ['Open requests', 'Assignments', 'Downtime', 'Inventory'], ['KPI cards', 'Site filters', 'Recent activity'], ['Fast operational awareness', 'Single landing view']),
    moduleSlide('KPI Cards', 'Dashboard Module', '/dashboard', 'Summarize important operational counts.', ['Requests', 'Equipment', 'Downtime', 'Assignments'], ['At-a-glance indicators', 'Color-coded cards', 'Site-aware metrics'], ['Faster decision making', 'Management-ready visibility']),
    moduleSlide('Charts and Metrics', 'Dashboard Module', '/dashboard', 'Visualize trends and operational distribution.', ['Status mix', 'Downtime trends', 'Maintenance volume'], ['Charts and metric panels', 'Operational summaries'], ['Better trend review', 'Data-driven planning']),

    moduleSlide('Company Profile', 'Company Settings Module', '/admin/company', 'Maintain company profile data used by the application shell.', ['Company name', 'Company code', 'Contact', 'Address'], ['Edit company details', 'Persist master profile'], ['Consistent enterprise identity', 'Centralized configuration']),
    moduleSlide('Logo Configuration', 'Company Settings Module', '/admin/company', 'Upload and preview company branding.', ['Logo file', 'Logo preview', 'Company status'], ['Logo upload field', 'Preview configured branding'], ['Branded demos and reports', 'Consistent presentation layer']),

    { type: 'workflow', title: 'Maintenance Workflow', route: '/maintenance/requests', flow: ['Maintenance Request', 'Assignment', 'Technician Work Log', 'Completion'], description: 'Corrective work moves from request intake to assignment, technician execution, and closure.' },
    { type: 'workflow', title: 'Preventive Maintenance Workflow', route: '/maintenance/preventive', flow: ['PM Schedule', 'Auto Generation', 'Assignment', 'Completion'], description: 'Recurring schedules generate planned work orders that follow the standard assignment and completion path.' },
    { type: 'workflow', title: 'Spare Parts Workflow', route: '/inventory/spare-parts', flow: ['Technician Request', 'Manager Approval', 'Store Manager Review', 'Stock Available?', 'Issue / Purchase Request', 'Consume / Return'], description: 'Spare requests are approved, checked for stock, issued when available, or converted to purchase requests.' },
    { type: 'workflow', title: 'Inventory Workflow', route: '/inventory/spare-parts', flow: ['Stock', 'Reserve', 'Issue', 'Consume', 'Return'], description: 'Inventory movements preserve traceability from reservation through issue, consumption, and return.' },

    moduleSlide('Reports & Analytics', 'Reports Module', '/reports/downtime-analysis', 'Analyze equipment history and downtime performance.', ['Equipment', 'Site', 'Date range', 'Downtime hours'], ['Downtime analysis report', 'Equipment history report', 'Filterable views'], ['Reliability insights', 'Better maintenance prioritization']),
    { type: 'future', title: 'Future Enhancements', route: '/dashboard' },
    { type: 'thanks', title: 'Thank You', route: '/dashboard' },
  ];
  return slides;
}

function addFooter(slide, slideNo) {
  slide.addShape(SHAPE.line, { x: 0.45, y: 7.05, w: 12.45, h: 0, line: { color: COLORS.line, width: 0.5 } });
  slide.addText('CMMS Application Demo', { x: 0.55, y: 7.13, w: 3.2, h: 0.18, fontSize: 7.5, color: COLORS.muted });
  slide.addText(String(slideNo), { x: 12.35, y: 7.13, w: 0.5, h: 0.18, fontSize: 7.5, color: COLORS.muted, align: 'right' });
}

function addHeader(slide, title, moduleName) {
  slide.addText(moduleName || 'CMMS Application', { x: 0.55, y: 0.25, w: 4.2, h: 0.22, fontSize: 8, bold: true, color: COLORS.blue });
  slide.addText(title, { x: 0.55, y: 0.52, w: 7.9, h: 0.45, fontSize: 20, bold: true, color: COLORS.ink, margin: 0 });
  slide.addShape(SHAPE.rect, { x: 11.4, y: 0.25, w: 1.3, h: 0.42, fill: { color: COLORS.yellow }, line: { color: COLORS.yellow } });
  slide.addText('ANDRITZ', { x: 11.47, y: 0.35, w: 1.16, h: 0.16, fontSize: 8, bold: true, color: COLORS.blueDark, align: 'center' });
}

function addScreenshot(slide, screenshot, x, y, w, h) {
  slide.addShape(SHAPE.rect, { x, y, w, h, fill: { color: COLORS.white }, line: { color: COLORS.line, width: 1 } });
  if (screenshot && fs.existsSync(screenshot)) {
    slide.addImage({ path: screenshot, x: x + 0.06, y: y + 0.06, w: w - 0.12, h: h - 0.12, sizing: { type: 'contain', x: x + 0.06, y: y + 0.06, w: w - 0.12, h: h - 0.12 } });
  }
}

function addBulletBlock(slide, title, items, x, y, w, color = COLORS.ink) {
  slide.addText(title, { x, y, w, h: 0.22, fontSize: 9.5, bold: true, color: COLORS.blue });
  const body = (items || []).map((item) => `• ${item}`).join('\n');
  slide.addText(body || '• Current application page', { x, y: y + 0.28, w, h: 0.78, fontSize: 8.4, color, breakLine: false, fit: 'shrink' });
}

function addModuleSlide(pptx, item, screenshot, slideNo) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.light };
  addHeader(slide, item.title, item.moduleName);
  addScreenshot(slide, screenshot, 0.55, 1.12, 7.25, 5.65);
  slide.addShape(SHAPE.roundRect, { x: 8.05, y: 1.12, w: 4.75, h: 5.65, rectRadius: 0.06, fill: { color: COLORS.white }, line: { color: COLORS.line, width: 0.8 } });
  slide.addText(item.description, { x: 8.3, y: 1.37, w: 4.25, h: 0.55, fontSize: 10.3, color: COLORS.ink, fit: 'shrink' });
  addBulletBlock(slide, 'Key Fields', item.keyFields, 8.3, 2.08, 4.25);
  addBulletBlock(slide, 'Features', item.features, 8.3, 3.35, 4.25);
  addBulletBlock(slide, 'Business Benefits', item.benefits, 8.3, 4.68, 4.25);
  if (item.substitution) {
    slide.addText(`Route note: ${item.substitution}`, { x: 8.3, y: 6.1, w: 4.25, h: 0.3, fontSize: 7.4, italic: true, color: COLORS.muted, fit: 'shrink' });
  }
  addFooter(slide, slideNo);
}

function addFlow(slide, flow, x, y, w) {
  const cols = 3;
  const boxW = (w - 0.45) / cols;
  const boxH = 0.45;
  flow.forEach((label, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const bx = x + col * (boxW + 0.22);
    const by = y + row * 0.78;
    slide.addShape(SHAPE.roundRect, { x: bx, y: by, w: boxW, h: boxH, rectRadius: 0.04, fill: { color: idx === 0 ? COLORS.blue : COLORS.white }, line: { color: COLORS.blue, width: 1 } });
    slide.addText(label, { x: bx + 0.05, y: by + 0.14, w: boxW - 0.1, h: 0.14, fontSize: 7.5, bold: idx === 0, color: idx === 0 ? COLORS.white : COLORS.ink, align: 'center', fit: 'shrink' });
    if (idx < flow.length - 1) {
      const nextCol = (idx + 1) % cols;
      const sameRow = nextCol !== 0;
      if (sameRow) {
        slide.addText('→', { x: bx + boxW + 0.05, y: by + 0.14, w: 0.15, h: 0.12, fontSize: 10, color: COLORS.blue, bold: true });
      }
    }
  });
}

function generatePresentation(slides, captures, discoveredRoutes) {
  const pptx = new pptxgen();
  SHAPE = pptx.ShapeType;
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'CMMS Application';
  pptx.company = 'ANDRITZ CMMS Demo';
  pptx.subject = 'Computerized Maintenance Management System Demo';
  pptx.title = 'CMMS Application Demo';
  pptx.lang = 'en-US';
  pptx.theme = {
    headFontFace: 'Aptos Display',
    bodyFontFace: 'Aptos',
    lang: 'en-US',
  };

  slides.forEach((item, idx) => {
    const slideNo = idx + 1;
    const screenshot = captures[idx]?.filePath;
    if (item.type === 'title') {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.blue };
      addScreenshot(slide, screenshot, 6.1, 0.65, 6.7, 5.8);
      slide.addText('CMMS Application', { x: 0.7, y: 1.25, w: 5.0, h: 0.55, fontSize: 28, bold: true, color: COLORS.white, margin: 0 });
      slide.addText('Computerized Maintenance Management System', { x: 0.72, y: 2.0, w: 4.8, h: 0.35, fontSize: 15, color: COLORS.yellow });
      slide.addText('Generated from current application', { x: 0.72, y: 2.5, w: 4.5, h: 0.3, fontSize: 11, color: 'E6EEF9' });
      slide.addShape(SHAPE.rect, { x: 0.72, y: 5.95, w: 1.45, h: 0.48, fill: { color: COLORS.yellow }, line: { color: COLORS.yellow } });
      slide.addText('ANDRITZ', { x: 0.82, y: 6.09, w: 1.25, h: 0.16, fontSize: 9, bold: true, color: COLORS.blueDark, align: 'center' });
      addFooter(slide, slideNo);
      return;
    }

    if (item.type === 'overview') {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.light };
      addHeader(slide, 'Application Overview', 'CMMS Application');
      addScreenshot(slide, screenshot, 7.05, 1.05, 5.75, 5.75);
      const modules = ['Asset Management', 'Maintenance Management', 'Inventory Management', 'Vendor Management', 'Employee Management', 'Preventive Maintenance', 'Spare Parts Management', 'Purchase Requests', 'Reporting and Dashboard'];
      modules.forEach((label, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        slide.addShape(SHAPE.roundRect, { x: 0.75 + col * 2.0, y: 1.3 + row * 1.1, w: 1.75, h: 0.72, rectRadius: 0.05, fill: { color: COLORS.white }, line: { color: COLORS.line } });
        slide.addText(label, { x: 0.88 + col * 2.0, y: 1.53 + row * 1.1, w: 1.5, h: 0.18, fontSize: 8.6, bold: true, color: COLORS.ink, align: 'center', fit: 'shrink' });
      });
      slide.addText('Built to connect master data, maintenance execution, spare-parts control, and operational reporting in one flow.', { x: 0.75, y: 5.05, w: 5.7, h: 0.58, fontSize: 13, color: COLORS.ink, fit: 'shrink' });
      addFooter(slide, slideNo);
      return;
    }

    if (item.type === 'toc') {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.light };
      addHeader(slide, 'Table of Contents', 'CMMS Application');
      addScreenshot(slide, screenshot, 8.0, 1.05, 4.8, 5.75);
      const toc = ['Application overview and navigation flow', 'Master data: company, site, employee, roles, vendor, equipment', 'Maintenance: request, assignment, downtime, preventive maintenance', 'Inventory: spare parts, stock movement, purchase requests', 'Notifications, dashboard, reports, and workflows'];
      toc.forEach((label, i) => {
        slide.addShape(SHAPE.ellipse, { x: 0.78, y: 1.35 + i * 0.82, w: 0.32, h: 0.32, fill: { color: COLORS.blue }, line: { color: COLORS.blue } });
        slide.addText(String(i + 1), { x: 0.78, y: 1.44 + i * 0.82, w: 0.32, h: 0.08, fontSize: 7, color: COLORS.white, bold: true, align: 'center' });
        slide.addText(label, { x: 1.25, y: 1.34 + i * 0.82, w: 6.2, h: 0.34, fontSize: 13, color: COLORS.ink, fit: 'shrink' });
      });
      addFooter(slide, slideNo);
      return;
    }

    if (item.type === 'navigation') {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.light };
      addHeader(slide, 'Application Navigation Flow', 'CMMS Application');
      addScreenshot(slide, screenshot, 8.05, 1.1, 4.75, 5.6);
      addFlow(slide, ['Company', 'Site', 'Employee', 'Roles & Permissions', 'Vendor', 'Equipment', 'Maintenance Request', 'Assignment', 'Downtime', 'Preventive Maintenance', 'Spare Parts', 'Inventory', 'Purchase Requests', 'Reports'], 0.65, 1.35, 6.8);
      slide.addText(`Routes discovered automatically from App.jsx: ${discoveredRoutes.length}`, { x: 0.72, y: 6.33, w: 6.5, h: 0.24, fontSize: 8.5, color: COLORS.muted });
      addFooter(slide, slideNo);
      return;
    }

    if (item.type === 'workflow') {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.light };
      addHeader(slide, item.title, 'Workflow');
      addScreenshot(slide, screenshot, 7.65, 1.1, 5.15, 5.65);
      slide.addText(item.description, { x: 0.72, y: 1.2, w: 6.35, h: 0.52, fontSize: 12, color: COLORS.ink, fit: 'shrink' });
      addFlow(slide, item.flow, 0.72, 2.2, 6.4);
      addBulletBlock(slide, 'Business Value', ['Traceable process ownership', 'Standardized approval and execution', 'Clear operational handoffs'], 0.72, 5.0, 6.2);
      addFooter(slide, slideNo);
      return;
    }

    if (item.type === 'future') {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.light };
      addHeader(slide, 'Future Enhancements', 'Roadmap');
      addScreenshot(slide, screenshot, 7.2, 1.1, 5.6, 5.65);
      addBulletBlock(slide, 'Potential Next Steps', ['Mobile technician app', 'QR-based asset scan flow', 'Advanced predictive maintenance', 'Deeper purchase integration', 'Role-specific dashboards', 'Exportable analytics packs'], 0.75, 1.45, 5.85);
      addFooter(slide, slideNo);
      return;
    }

    if (item.type === 'thanks') {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.blue };
      addScreenshot(slide, screenshot, 6.8, 0.85, 5.9, 5.6);
      slide.addText('Thank You', { x: 0.8, y: 2.25, w: 4.8, h: 0.65, fontSize: 32, bold: true, color: COLORS.white });
      slide.addText('CMMS Application Demo', { x: 0.82, y: 3.05, w: 4.6, h: 0.3, fontSize: 15, color: COLORS.yellow });
      slide.addText('Generated from current running application UI', { x: 0.82, y: 3.5, w: 4.8, h: 0.25, fontSize: 10.5, color: 'E6EEF9' });
      addFooter(slide, slideNo);
      return;
    }

    addModuleSlide(pptx, item, screenshot, slideNo);
  });

  return pptx.writeFile({ fileName: PRESENTATION_PATH });
}

async function main() {
  if (process.env.CMMS_SKIP_CAPTURE !== '1') {
    cleanDir(SCREENSHOT_DIR);
  } else {
    ensureDir(SCREENSHOT_DIR);
  }
  ensureDir(PRESENTATION_DIR);
  const discoveredRoutes = discoverRoutes();
  const access = await getDemoAccess();
  const ids = await resolveIds(access.token);
  const slidePlan = buildSlidePlan(ids);

  const captures = [];
  if (process.env.CMMS_SKIP_CAPTURE === '1') {
    for (let i = 0; i < slidePlan.length; i += 1) {
      const item = slidePlan[i];
      const filePath = screenshotPath(i + 1, item.title);
      captures.push({
        name: item.title,
        route: item.route || '/dashboard',
        filePath,
        status: fs.existsSync(filePath) ? 'captured' : 'failed',
        error: fs.existsSync(filePath) ? null : 'Screenshot file missing during no-capture generation.',
        note: item.substitution || null,
      });
    }
  } else {
    const browser = await chromium.launch({
      headless: true,
      executablePath: fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined,
    });
    const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByLabel('Username').fill(USERNAME);
    await page.getByLabel('Password').fill(PASSWORD);
    await Promise.all([
      page.waitForURL(/dashboard/, { timeout: 25000 }).catch(() => {}),
      page.getByRole('button', { name: 'Login' }).click(),
    ]);
    await waitForUi(page);

    for (let i = 0; i < slidePlan.length; i += 1) {
      const item = slidePlan[i];
      const route = item.route || '/dashboard';
      const result = await capture(page, item.title, route, { index: i + 1, action: item.action, note: item.substitution });
      captures.push(result);
      console.log(`[${i + 1}/${slidePlan.length}] ${result.status}: ${item.title} (${route})`);
    }

    await browser.close();
  }
  await generatePresentation(slidePlan, captures, discoveredRoutes);

  const report = {
    generatedAt: new Date().toISOString(),
    frontendUrl: FRONTEND_URL,
    apiUrl: API_URL,
    presentationPath: PRESENTATION_PATH,
    screenshotDir: SCREENSHOT_DIR,
    discoveredRoutes,
    resolvedIds: ids,
    screenshots: captures.map((capture) => ({
      name: capture.name,
      route: capture.route,
      file: path.relative(ROOT, capture.filePath).replace(/\\/g, '/'),
      status: capture.status,
      error: capture.error,
      note: capture.note,
    })),
    slides: slidePlan.map((slide, index) => ({
      number: index + 1,
      title: slide.title,
      moduleName: slide.moduleName || slide.type,
      route: slide.route,
      substitution: slide.substitution || null,
    })),
    notCaptured: captures.filter((capture) => capture.status !== 'captured'),
    substitutions: slidePlan.filter((slide) => slide.substitution).map((slide) => ({
      title: slide.title,
      route: slide.route,
      note: slide.substitution,
    })),
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`Presentation written: ${PRESENTATION_PATH}`);
  console.log(`Report written: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
