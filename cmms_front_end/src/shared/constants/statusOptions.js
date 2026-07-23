import { getDropdownOptions } from '../utils/dropdownHelper';

export const ACTIVE_STATUS_OPTIONS = getDropdownOptions('COMMON', 'activeStatus');
export const BOOLEAN_ACTIVE_STATUS_OPTIONS = getDropdownOptions('COMMON', 'booleanActiveStatus');
export const MAINTENANCE_REQUEST_STATUS_OPTIONS = getDropdownOptions('MAINTENANCE_REQUEST', 'requestStatus');
export const ASSIGNMENT_STATUS_OPTIONS = getDropdownOptions('MAINTENANCE_ASSIGNMENT', 'assignmentStatus');
export const PRIORITY_OPTIONS = getDropdownOptions('MAINTENANCE_REQUEST', 'priority');
export const CRITICALITY_PRIORITY_OPTIONS = getDropdownOptions('COMMON', 'criticalityPriority');
export const PM_FREQUENCY_OPTIONS = getDropdownOptions('PREVENTIVE_MAINTENANCE', 'frequency');
export const APPROVAL_STATUS_OPTIONS = getDropdownOptions('APPROVAL', 'approvalStatus');
export const APPROVAL_MODULE_OPTIONS = getDropdownOptions('APPROVAL', 'approvalModule');
export const APPROVAL_ACTION_OPTIONS = getDropdownOptions('APPROVAL', 'approvalAction');
