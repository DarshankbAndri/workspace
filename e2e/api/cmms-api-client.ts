import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { expectSuccess } from '../helpers/api-envelope.js';

export interface SearchRequest {
  searchCriteriaList?: Array<{ filterKey: string; dataType: string; value: unknown; operation: string }>;
  dataOption?: 'all' | 'any';
  pagination?: { pageNumber: number; pageSize: number; recordsPerPage: number; status?: string; sortBy?: string; sortMode?: 'ASC' | 'DESC' };
}

export interface SearchPage<T> { data: T[]; totalRecords: number; pageNumber: number; pageSize: number; totalPages: number }

export class CmmsApiClient {
  constructor(readonly request: APIRequestContext) {}

  private path(path: string): string { return path.replace(/^\/+/, ''); }
  get(path: string): Promise<APIResponse> { return this.request.get(this.path(path)); }
  post(path: string, data?: unknown): Promise<APIResponse> { return this.request.post(this.path(path), { data }); }
  put(path: string, data?: unknown): Promise<APIResponse> { return this.request.put(this.path(path), { data }); }
  delete(path: string): Promise<APIResponse> { return this.request.delete(this.path(path)); }

  async getData<T>(path: string): Promise<T> { return expectSuccess<T>(await this.get(path)); }
  async postData<T>(path: string, data?: unknown, status?: number): Promise<T> {
    return expectSuccess<T>(await this.post(path, data), status);
  }
  async putData<T>(path: string, data?: unknown): Promise<T> { return expectSuccess<T>(await this.put(path, data)); }
  async deleteData(path: string): Promise<void> { await expectSuccess(await this.delete(path)); }

  async search<T>(path: string, request: SearchRequest): Promise<T> {
    const response = await this.post(path, request);
    expect(response.status(), await response.text()).toBe(200);
    return expectSuccess<T>(response);
  }
}
