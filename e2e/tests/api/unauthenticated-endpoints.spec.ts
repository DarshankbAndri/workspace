import { request, test, expect } from '@playwright/test';
import { env } from '../../helpers/env.js';
import { openApiOperations } from '../../helpers/contract-inventory.js';

const isPublic = (path: string) => path.startsWith('/auth/') || path === '/system/time'
  || path.startsWith('/company/logo/') || path.startsWith('/actuator/')
  || path.startsWith('/v3/api-docs') || path.startsWith('/swagger') || path === '/error';

test('@api @security every protected OpenAPI operation rejects an anonymous caller', async () => {
  const client = await request.newContext({ baseURL: env.apiBaseUrl });
  const specResponse = await client.get('v3/api-docs');
  expect(specResponse.ok()).toBeTruthy();
  const operations = openApiOperations(await specResponse.json());
  const failures: string[] = [];
  for (const operation of operations.filter((item) => !isPublic(item.path))) {
    const path = operation.path.replace(/\{[^}]+\}/g, '999999999').replace(/^\/+/, '');
    const response = await client.fetch(path, {
      method: operation.method,
      headers: { 'Content-Type': 'application/json' },
      data: operation.method === 'GET' || operation.method === 'DELETE' ? undefined : {},
    });
    if (![401, 403].includes(response.status())) failures.push(`${operation.method} ${operation.path} -> ${response.status()}`);
  }
  await client.dispose();
  expect(failures, 'Protected routes that did not reject anonymous access').toEqual([]);
});
