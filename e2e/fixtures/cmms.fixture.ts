import { test as base, expect, request as playwrightRequest } from '@playwright/test';
import fs from 'node:fs';
import { CmmsApiClient } from '../api/cmms-api-client.js';
import { env } from '../helpers/env.js';
import { createRunId } from '../helpers/run-id.js';
import { ResourceTracker } from '../helpers/resource-tracker.js';

type CmmsFixtures = {
  api: CmmsApiClient;
  runId: string;
  resources: ResourceTracker;
};

function adminToken(): string {
  const state = JSON.parse(fs.readFileSync(env.authStatePath, 'utf8')) as {
    origins: Array<{ localStorage: Array<{ name: string; value: string }> }>;
  };
  const token = state.origins.flatMap((origin) => origin.localStorage).find((entry) => entry.name === 'token')?.value;
  if (!token) throw new Error('Admin token is missing from storage state.');
  return token;
}

export const test = base.extend<CmmsFixtures>({
  api: async ({}, use) => {
    const context = await playwrightRequest.newContext({
      baseURL: env.apiBaseUrl,
      extraHTTPHeaders: { Authorization: `Bearer ${adminToken()}` },
    });
    await use(new CmmsApiClient(context));
    await context.dispose();
  },
  runId: async ({}, use, testInfo) => {
    await use(`${createRunId()}-${testInfo.workerIndex}`.slice(0, 25));
  },
  resources: async ({}, use, testInfo) => {
    const tracker = new ResourceTracker();
    await use(tracker);
    await tracker.cleanup(testInfo);
  },
});

export { expect };
