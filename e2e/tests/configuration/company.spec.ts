import { test, expect } from '../../fixtures/cmms.fixture.js';
import type { Entity } from '../../fixtures/core-data.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test('@api @regression current company persists changes and validates duplicate codes and invalid input', async ({ api, resources, runId }) => {
  let original = await api.getData<Entity | null>('/company/current');
  if (!original) {
    original = await api.postData<Entity>('/company/create', {
      companyCode: runId, companyName: `${runId} Company`, status: 'ACTIVE', email: 'company@example.invalid',
    }, 201);
  }
  const company = original;
  resources.add('restore company', () => api.putData(`/company/update/${company.id}`, company));
  await api.putData(`/company/update/${company.id}`, { ...company, companyName: `${runId} Updated`, address: 'E2E address' });
  const persisted = await api.getData<Entity>(`/company/${company.id}`);
  expect(persisted.companyName).toBe(`${runId} Updated`);
  expect(persisted.address).toBe('E2E address');
  await expectApiError(await api.post('/company/create', { companyCode: company.companyCode, companyName: 'Duplicate' }), 400);
  await expectApiError(await api.put(`/company/update/${company.id}`, { ...company, email: 'invalid' }), 400);
  await expectApiError(await api.put(`/company/update/${company.id}`, { ...company, companyName: '' }), 400);
  expect((await api.getData<Entity>('/company/current')).companyName).toBe(`${runId} Updated`);
});
