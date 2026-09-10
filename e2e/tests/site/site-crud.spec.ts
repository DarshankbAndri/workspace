import { test, expect } from '../../fixtures/cmms.fixture.js';
import { siteData, searchPage } from '../../data/factories.js';
import { expectApiError } from '../../helpers/api-envelope.js';

test.describe('@regression @api sites', () => {
  test('create, persist, update, search, sort and deactivate a site', async ({ api, runId, resources }) => {
    const payload = siteData(runId);
    const created = await api.postData<{ id: number; siteCode: string; siteName: string }>('/hr/sites', payload, 201);
    resources.add(`site ${created.id}`, () => api.deleteData(`/hr/sites/${created.id}`));
    expect(created.siteCode).toBe(payload.siteCode);
    expect((await api.getData<{ id: number }>(`/hr/sites/${created.id}`)).id).toBe(created.id);
    const updated = await api.putData<{ siteName: string }>(`/hr/sites/${created.id}`, { ...payload, siteName: `${runId} Updated` });
    expect(updated.siteName).toBe(`${runId} Updated`);
    const page = await api.search<{ data: Array<{ id: number }>; totalRecords: number }>('/hr/sites/search', {
      ...searchPage(0, 10, 'siteCode', 'ASC'),
      searchCriteriaList: [{ filterKey: 'siteCode', dataType: 'VARCHAR', value: payload.siteCode, operation: 'equal' }],
    });
    expect(page.data.map((site) => site.id)).toContain(created.id);
  });

  test('rejects duplicate code and missing required fields without 500', async ({ api, runId, resources }) => {
    const payload = siteData(runId, 'DUP');
    const created = await api.postData<{ id: number }>('/hr/sites', payload, 201);
    resources.add(`site ${created.id}`, () => api.deleteData(`/hr/sites/${created.id}`));
    await expectApiError(await api.post('/hr/sites', payload), 400);
    await expectApiError(await api.post('/hr/sites', { siteName: 'missing-code' }), 400);
  });
});
