export const ACTIVE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

export const BOOLEAN_ACTIVE_STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export const MAINTENANCE_REQUEST_STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const ASSIGNMENT_STATUS_OPTIONS = [
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export const CRITICALITY_PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'LOW' },
  { value: 'MEDIUM', label: 'MEDIUM' },
  { value: 'HIGH', label: 'HIGH' },
  { value: 'CRITICAL', label: 'CRITICAL' },
];

export const PM_FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'DAILY' },
  { value: 'WEEKLY', label: 'WEEKLY' },
  { value: 'MONTHLY', label: 'MONTHLY' },
  { value: 'QUARTERLY', label: 'QUARTERLY' },
  { value: 'YEARLY', label: 'YEARLY' },
];

export const APPROVAL_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const APPROVAL_MODULE_OPTIONS = [
  { value: 'MAINTENANCE_REQUEST', label: 'Maintenance Request' },
  { value: 'PM_SCHEDULE', label: 'PM Schedule' },
  { value: 'PM_WORK_ORDER', label: 'PM Work Order' },
  { value: 'SPARE_ISSUE', label: 'Spare Issue' },
];

export const APPROVAL_ACTION_OPTIONS = [
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'GENERATE', label: 'Generate' },
  { value: 'CLOSE', label: 'Close' },
  { value: 'RESERVE', label: 'Reserve' },
  { value: 'ISSUE', label: 'Issue' },
];
