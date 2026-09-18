import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '../../fixtures/cmms.fixture.js';
import { frontendOperations, openApiOperations, operationKey, permissionOperations } from '../../helpers/contract-inventory.js';

const publicPath = (value: string) => value.startsWith('/auth/')
  || value === '/system/time'
  || value.startsWith('/company/logo/')
  || value.startsWith('/actuator/')
  || value.startsWith('/v3/api-docs')
  || value.startsWith('/swagger')
  || value === '/error';

test('@api @regression frontend, OpenAPI and permission contracts stay aligned', async ({ api }, testInfo) => {
  const response = await api.get('/v3/api-docs');
  expect(response.ok(), await response.text()).toBeTruthy();
  const openApi = await response.json() as { paths: Record<string, Record<string, unknown>> };
  const backend = openApiOperations(openApi);
  const backendKeys = new Set(backend.map(operationKey));
  const frontend = frontendOperations();
  const frontendMissing = frontend.filter((operation) => !backendKeys.has(operationKey(operation)));

  const mapped = permissionOperations();
  const protectedUnmapped = backend.filter((operation) => !publicPath(operation.path) && !mapped.has(operationKey(operation)));
  const report = { generatedAt: new Date().toISOString(), backendCount: backend.length, frontendCount: frontend.length,
    frontendMissing, protectedUnmapped };
  fs.mkdirSync(path.resolve('reports'), { recursive: true });
  fs.writeFileSync(path.resolve('reports/api-contract.json'), JSON.stringify(report, null, 2));
  await testInfo.attach('api-contract', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });

  expect(frontendMissing, 'Frontend operations without backend routes').toEqual([]);
  expect(protectedUnmapped, 'Protected backend operations without permission mappings').toEqual([]);
});
