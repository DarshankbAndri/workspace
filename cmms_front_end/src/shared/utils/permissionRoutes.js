export const PERMISSIONS = {
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
  EQUIPMENT_VIEW: 'EQUIPMENT_VIEW',
  EQUIPMENT_CREATE: 'EQUIPMENT_CREATE',
  EQUIPMENT_UPDATE: 'EQUIPMENT_UPDATE',
  EQUIPMENT_DELETE: 'EQUIPMENT_DELETE',
  VENDOR_VIEW: 'VENDOR_VIEW',
  VENDOR_CREATE: 'VENDOR_CREATE',
  VENDOR_UPDATE: 'VENDOR_UPDATE',
  VENDOR_DELETE: 'VENDOR_DELETE',
  REQUEST_VIEW: 'REQUEST_VIEW',
  REQUEST_CREATE: 'REQUEST_CREATE',
  PM_CALENDAR_VIEW: 'PM_CALENDAR_VIEW',
  ASSIGNMENT_VIEW: 'ASSIGNMENT_VIEW',
  DOWNTIME_VIEW: 'DOWNTIME_VIEW',
  DOWNTIME_CONFIRM: 'DOWNTIME_CONFIRM',
  DOWNTIME_VERIFY: 'DOWNTIME_VERIFY',
  DOWNTIME_CLOSE: 'DOWNTIME_CLOSE',
  DOWNTIME_REOPEN: 'DOWNTIME_REOPEN',
  DOWNTIME_RCA_MANAGE: 'DOWNTIME_RCA_MANAGE',
  APPROVAL_VIEW: 'APPROVAL_VIEW',
  APPROVAL_APPROVE: 'APPROVAL_APPROVE',
  APPROVAL_REJECT: 'APPROVAL_REJECT',
  REPORT_VIEW: 'REPORT_VIEW',
  SPARE_PART_VIEW: 'SPARE_PART_VIEW',
  SPARE_PART_CREATE: 'SPARE_PART_CREATE',
  SPARE_PART_UPDATE: 'SPARE_PART_UPDATE',
  SPARE_PART_DELETE: 'SPARE_PART_DELETE',
  STOCK_TRANSACTION_VIEW: 'STOCK_TRANSACTION_VIEW',
  STOCK_TRANSACTION_CREATE: 'STOCK_TRANSACTION_CREATE',
  SPARE_USAGE_MANAGER_APPROVE: 'SPARE_USAGE_MANAGER_APPROVE',
  SPARE_USAGE_STORE_PROCESS: 'SPARE_USAGE_STORE_PROCESS',
  SPARE_USAGE_RESERVE: 'SPARE_USAGE_RESERVE',
  SPARE_USAGE_ISSUE: 'SPARE_USAGE_ISSUE',
  SPARE_USAGE_CONSUME: 'SPARE_USAGE_CONSUME',
  REORDER_VIEW: 'REORDER_VIEW',
  REORDER_CREATE: 'REORDER_CREATE',
  REORDER_UPDATE: 'REORDER_UPDATE',
  SITE_VIEW: 'SITE_VIEW',
  SITE_CREATE: 'SITE_CREATE',
  SITE_UPDATE: 'SITE_UPDATE',
  SITE_DELETE: 'SITE_DELETE',
  EMPLOYEE_VIEW: 'EMPLOYEE_VIEW',
  EMPLOYEE_CREATE: 'EMPLOYEE_CREATE',
  EMPLOYEE_UPDATE: 'EMPLOYEE_UPDATE',
  EMPLOYEE_DELETE: 'EMPLOYEE_DELETE',
  ROLE_VIEW: 'ROLE_VIEW',
  PERMISSION_VIEW: 'PERMISSION_VIEW',
  USER_ROLE_VIEW: 'USER_ROLE_VIEW',
  USER_ROLE_ASSIGN: 'USER_ROLE_ASSIGN',
  APPROVAL_CONFIG_VIEW: 'APPROVAL_CONFIG_VIEW',
  APPROVAL_CONFIG_UPDATE: 'APPROVAL_CONFIG_UPDATE',
  NOTIFICATION_VIEW: 'NOTIFICATION_VIEW',
  NOTIFICATION_UPDATE: 'NOTIFICATION_UPDATE',
  NOTIFICATION_CONFIG_VIEW: 'NOTIFICATION_CONFIG_VIEW',
  NOTIFICATION_CONFIG_UPDATE: 'NOTIFICATION_CONFIG_UPDATE',
  COMPANY_VIEW: 'COMPANY_VIEW',
  COMPANY_CREATE: 'COMPANY_CREATE',
  COMPANY_UPDATE: 'COMPANY_UPDATE',
};

export const AUTHORIZED_ROUTES = [
  { path: '/dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
  { path: '/equipment', permission: PERMISSIONS.EQUIPMENT_VIEW },
  { path: '/vendors', permission: PERMISSIONS.VENDOR_VIEW },
  { path: '/maintenance/requests', permission: PERMISSIONS.REQUEST_VIEW },
  { path: '/maintenance/assignments', permission: PERMISSIONS.ASSIGNMENT_VIEW },
  { path: '/maintenance/downtime', permission: PERMISSIONS.DOWNTIME_VIEW },
  { path: '/maintenance/preventive', permission: PERMISSIONS.REQUEST_VIEW },
  { path: '/maintenance/preventive/calendar', permission: PERMISSIONS.PM_CALENDAR_VIEW },
  { path: '/approvals/pending', permission: PERMISSIONS.APPROVAL_VIEW },
  { path: '/approvals/history', permission: PERMISSIONS.APPROVAL_VIEW },
  { path: '/reports/equipment-history', permission: PERMISSIONS.REPORT_VIEW },
  { path: '/reports/downtime-analysis', permission: PERMISSIONS.REPORT_VIEW },
  { path: '/reports/equipment-cost', permission: PERMISSIONS.REPORT_VIEW },
  { path: '/inventory/spare-parts', permission: PERMISSIONS.SPARE_PART_VIEW },
  { path: '/inventory/spare-approvals', permission: PERMISSIONS.SPARE_USAGE_MANAGER_APPROVE },
  { path: '/inventory/spare-requests', permission: PERMISSIONS.SPARE_USAGE_STORE_PROCESS },
  { path: '/inventory/reorders', permission: PERMISSIONS.REORDER_VIEW },
  { path: '/hr/sites', permission: PERMISSIONS.SITE_VIEW },
  { path: '/hr/employees', permission: PERMISSIONS.EMPLOYEE_VIEW },
  { path: '/admin/roles', permission: PERMISSIONS.ROLE_VIEW },
  { path: '/admin/permissions', permission: PERMISSIONS.PERMISSION_VIEW },
  { path: '/admin/user-roles', permission: PERMISSIONS.USER_ROLE_VIEW },
  { path: '/create-user', permission: PERMISSIONS.USER_ROLE_ASSIGN },
  { path: '/admin/approval-config', permission: PERMISSIONS.APPROVAL_CONFIG_VIEW },
  { path: '/admin/notification-settings', permission: PERMISSIONS.NOTIFICATION_CONFIG_VIEW },
  { path: '/admin/company', permission: PERMISSIONS.COMPANY_VIEW },
  { path: '/notifications', permission: PERMISSIONS.NOTIFICATION_VIEW },
];

export const getFirstAllowedPath = (hasPermission) => (
  AUTHORIZED_ROUTES.find((route) => hasPermission(route.permission))?.path || '/dashboard'
);

export const hasAccessPermission = (access = {}, permissionCode) => {
  if (!permissionCode) return true;
  const roles = access.roles || [];
  const permissions = access.permissions || [];
  const user = access.user || {};
  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN') || user.role === 'ADMIN') return true;
  return permissions.includes(permissionCode);
};

export const getFirstAllowedPathFromAccess = (access = {}) => (
  getFirstAllowedPath((permissionCode) => hasAccessPermission(access, permissionCode))
);
