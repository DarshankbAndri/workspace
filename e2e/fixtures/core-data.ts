import type { CmmsApiClient } from '../api/cmms-api-client.js';
import type { ResourceTracker } from '../helpers/resource-tracker.js';
import { assignmentData, employeeData, equipmentData, requestData, siteData, sparePartData, vendorData } from '../data/factories.js';

export interface Entity { id: number; [key: string]: unknown }
export interface SparePart extends Entity { stockId: number; currentStock: number }

export async function createMasterData(api: CmmsApiClient, resources: ResourceTracker, runId: string) {
  const site = await api.postData<Entity>('/hr/sites', siteData(runId), 201);
  resources.add(`site ${site.id}`, () => api.deleteData(`/hr/sites/${site.id}`));
  const employee = await api.postData<Entity>('/hr/employees', employeeData(runId, site.id), 201);
  resources.add(`employee ${employee.id}`, () => api.deleteData(`/hr/employees/${employee.id}`));
  const vendor = await api.postData<Entity>('/vendors', vendorData(runId, site.id), 201);
  resources.add(`vendor ${vendor.id}`, () => api.deleteData(`/vendors/${vendor.id}`));
  const equipment = await api.postData<Entity>('/equipment', equipmentData(runId, site.id, vendor.id), 201);
  resources.add(`equipment ${equipment.id}`, () => api.deleteData(`/equipment/${equipment.id}`));
  return { site, employee, vendor, equipment };
}

export async function createMaintenanceData(api: CmmsApiClient, resources: ResourceTracker, runId: string) {
  const master = await createMasterData(api, resources, runId);
  const request = await api.postData<Entity>('/maintenance/requests', requestData(runId, master.site.id, master.equipment.id), 201);
  resources.add(`request ${request.id}`, () => api.deleteData(`/maintenance/requests/${request.id}`));
  const assignment = await api.postData<Entity>('/maintenance/assignments', assignmentData(
    runId, master.site.id, request.id, master.vendor.id, master.employee.id,
  ), 201);
  resources.add(`assignment ${assignment.id}`, () => api.deleteData(`/maintenance/assignments/${assignment.id}`));
  return { ...master, request, assignment };
}

export async function createSpare(api: CmmsApiClient, resources: ResourceTracker, runId: string, siteId: number, vendorId?: number) {
  const spare = await api.postData<SparePart>('/spare-parts', sparePartData(runId, siteId, vendorId), 201);
  const stockId = spare.stockId || spare.id;
  resources.add(`spare stock ${stockId}`, () => api.deleteData(`/spare-parts/${stockId}`));
  return { ...spare, stockId };
}
