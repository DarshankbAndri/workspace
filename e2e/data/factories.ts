import { uniqueCode } from '../helpers/run-id.js';

export const searchPage = (pageNumber = 0, pageSize = 10, sortBy = 'createdAt', sortMode: 'ASC' | 'DESC' = 'DESC') => ({
  searchCriteriaList: [], dataOption: 'all' as const,
  pagination: { pageNumber, pageSize: 0, recordsPerPage: pageSize, status: 'ON', sortBy, sortMode },
});

export const siteData = (runId: string, suffix = 'SITE') => ({
  siteCode: uniqueCode(runId, suffix), siteName: `${runId} ${suffix}`, organizationName: 'CMMS E2E',
  siteType: 'PLANT', addressLine1: 'E2E Industrial Area', city: 'Pune', state: 'Maharashtra',
  country: 'India', pincode: '411001', contactPerson: 'E2E Contact', contactMobile: '9000000001',
  contactEmail: `${runId.toLowerCase()}.${suffix.toLowerCase()}@example.invalid`, status: 'ACTIVE',
});

export const employeeData = (runId: string, siteId: number, suffix = 'EMP') => ({
  employeeCode: uniqueCode(runId, suffix), firstName: 'E2E', lastName: suffix,
  mobileNumber: `8${Date.now().toString().slice(-9)}`, email: `${runId.toLowerCase()}.${suffix.toLowerCase()}@example.invalid`,
  gender: 'OTHER', dateOfBirth: '1990-01-01', dateOfJoining: '2026-01-01', designation: 'Technician',
  department: 'Maintenance', status: 'ACTIVE',
  siteAssignments: [{ siteId, roleName: 'Technician', primarySite: true, status: 'ACTIVE' }],
});

export const vendorData = (runId: string, siteId: number, suffix = 'VEN') => ({
  vendorCode: uniqueCode(runId, suffix), vendorName: `${runId} ${suffix} Vendor`, contactPerson: 'E2E Vendor',
  email: `${runId.toLowerCase()}.${suffix.toLowerCase()}@example.invalid`, phone: '9000000002',
  serviceCategory: 'MECHANICAL', active: true,
  siteAssignments: [{ siteId, primarySite: true, status: 'ACTIVE' }],
});

export const equipmentData = (runId: string, siteId: number, vendorId?: number, suffix = 'EQ') => ({
  equipmentCode: uniqueCode(runId, suffix), equipmentName: `${runId} ${suffix} Equipment`, siteId, vendorId,
  category: 'PUMP', equipmentType: 'ROTATING', location: 'E2E Bay', status: 'ACTIVE',
  lifecycleStatus: 'ACTIVE', assetCondition: 'GOOD', operatingStatus: 'RUNNING', criticality: 'MEDIUM',
});

export const requestData = (runId: string, siteId: number, equipmentId: number, suffix = 'REQ') => ({
  siteId, equipmentId, requestType: 'BREAKDOWN', priority: 'MEDIUM', title: `${runId} ${suffix}`,
  description: 'CMMS automated E2E maintenance request', reportedBy: 'E2E', requestedDate: '2026-09-07',
  targetCompletionDate: '2026-09-10',
});

export const assignmentData = (runId: string, siteId: number, requestId: number, vendorId: number, employeeId: number) => ({
  siteId, requestId, vendorId, assignedEmployeeId: employeeId, assignedTo: 'EMPLOYEE', assignedDate: '2026-09-07',
  plannedStartDate: '2026-09-07', plannedEndDate: '2026-09-10', status: 'ASSIGNED', remarks: runId,
});

export const sparePartData = (runId: string, siteId: number, vendorId?: number, suffix = 'PART') => ({
  partCode: uniqueCode(runId, suffix), partName: `${runId} ${suffix}`, siteId, preferredVendorId: vendorId,
  unit: 'EA', category: 'MECHANICAL', status: 'ACTIVE', currentStock: 100, minimumStock: 10,
  unitCost: 10, storageLocation: 'E2E-RACK',
});
