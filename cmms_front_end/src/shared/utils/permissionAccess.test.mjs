import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hasAnyEffectivePermission, hasEffectivePermission } from './permissionPolicy.js';

const read = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

test('effective permission policy denies missing access and allows explicit or administrative access', () => {
  assert.equal(hasEffectivePermission({}, 'EQUIPMENT_VIEW'), false);
  assert.equal(hasEffectivePermission({ permissions: ['EQUIPMENT_VIEW'] }, 'EQUIPMENT_VIEW'), true);
  assert.equal(hasEffectivePermission({ roles: ['ADMIN'] }, 'EQUIPMENT_DELETE'), true);
  assert.equal(hasEffectivePermission({ roles: ['SUPER_ADMIN'] }, 'ROLE_DELETE'), true);
  assert.equal(hasEffectivePermission({ legacyRole: 'ADMIN' }, 'USER_ROLE_UPDATE'), true);
  assert.equal(hasEffectivePermission({}, null), true);
});

test('any-permission policy requires one listed permission and accepts an empty requirement', () => {
  const access = { permissions: ['ASSIGNMENT_WORK_LOG_VIEW'] };
  assert.equal(hasAnyEffectivePermission(access, ['ASSIGNMENT_CHECKLIST_VIEW', 'ASSIGNMENT_WORK_LOG_VIEW']), true);
  assert.equal(hasAnyEffectivePermission(access, ['SPARE_USAGE_VIEW']), false);
  assert.equal(hasAnyEffectivePermission(access, []), true);
});

test('notification navigation and shared navbar honor notification permissions', () => {
  const app = read('../../App.jsx');
  const navbar = read('../layouts/TopNavbar.jsx');

  assert.match(app, /path="\/notifications"[^\n]+NOTIFICATION_VIEW/);
  assert.match(navbar, /const canViewNotifications = hasPermission\('NOTIFICATION_VIEW'\)/);
  assert.match(navbar, /const canUpdateNotifications = hasPermission\('NOTIFICATION_UPDATE'\)/);
  assert.match(navbar, /\{canViewNotifications && \(/);
  assert.match(navbar, /\{canUpdateNotifications && \(/);
});

test('user role page provides a working assignment editor', () => {
  const page = read('../../features/admin/pages/UserRoleAssignmentPage.jsx');

  assert.match(page, /replaceUserRoleAssignments/);
  assert.match(page, /Add Assignment/);
  assert.match(page, /Save Assignments/);
  assert.doesNotMatch(page, /full assignment editor can be added/i);
});

test('assignment workflow sections are gated by their view permissions', () => {
  for (const path of [
    '../../features/assignment/pages/MaintenanceAssignmentViewPage.jsx',
    '../../features/assignment/pages/MaintenanceAssignmentFormPage.jsx',
  ]) {
    const source = read(path);
    assert.match(source, /hasPermission\('ASSIGNMENT_CHECKLIST_VIEW'\)/);
    assert.match(source, /hasPermission\('ASSIGNMENT_WORK_LOG_VIEW'\)/);
    assert.match(source, /hasPermission\('SPARE_USAGE_VIEW'\)/);
  }

  const form = read('../../features/assignment/pages/MaintenanceAssignmentFormPage.jsx');
  assert.match(form, /!isView && hasPermission\('SPARE_USAGE_CREATE'\)/);
});

test('frontend permission checks match protected API mappings', () => {
  const csv = read('../../../../cmms_back_end/src/main/resources/api-permission-mapping.csv');
  const properties = read('../../../../cmms_back_end/src/main/resources/application.properties');

  assert.match(csv, /ASSIGNMENT_WORK_LOG_ATTACHMENT_UPLOAD,[^\n]+attachments,POST/);
  assert.match(csv, /ASSIGNMENT_WORK_LOG_ATTACHMENT_DELETE,[^\n]+attachments\/\{attachmentId\},DELETE/);
  assert.match(csv, /ASSIGNMENT_CHECKLIST_VIEW,[^\n]+proof\/\{proofId\},GET/);
  assert.match(csv, /ASSIGNMENT_WORK_LOG_VIEW,[^\n]+attachments\/\{attachmentId\},GET/);
  assert.match(csv, /ROLE_CREATE,\/api\/admin\/permissions\/grouped,GET/);
  assert.match(csv, /USER_ROLE_VIEW,\/api\/admin\/roles,GET/);
  assert.match(properties, /cmms\.security\.api-permission-restriction-enabled=true/);
});
