import { expect, type APIResponse } from '@playwright/test';

export interface ApiEnvelope<T> {
  timestamp?: string;
  status: number;
  success: boolean;
  code: string;
  message: string;
  data: T;
  correlationId?: string;
  details?: Array<{ field?: string; message?: string }>;
}

export async function readEnvelope<T>(response: APIResponse): Promise<ApiEnvelope<T>> {
  const contentType = response.headers()['content-type'] || '';
  expect(contentType, `Expected JSON from ${response.url()}`).toContain('application/json');
  return await response.json() as ApiEnvelope<T>;
}

export async function expectSuccess<T>(response: APIResponse, expectedStatus?: number): Promise<T> {
  if (expectedStatus !== undefined) expect(response.status()).toBe(expectedStatus);
  else expect(response.ok(), await response.text()).toBeTruthy();
  const envelope = await readEnvelope<T>(response);
  expect(envelope.success).toBe(true);
  expect(envelope.status).toBe(response.status());
  expect(envelope.correlationId).toBeTruthy();
  return envelope.data;
}

export async function expectApiError(response: APIResponse, status: number, codes?: string[]): Promise<ApiEnvelope<never>> {
  expect(response.status()).toBe(status);
  const envelope = await readEnvelope<never>(response);
  expect(envelope.success).toBe(false);
  expect(envelope.status).toBe(status);
  expect(envelope.correlationId).toBeTruthy();
  if (codes?.length) expect(codes).toContain(envelope.code);
  expect(JSON.stringify(envelope)).not.toMatch(/NullPointerException|org\.hibernate|java\.lang\.|stackTrace/i);
  return envelope;
}
