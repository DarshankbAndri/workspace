import type { FullConfig } from '@playwright/test';
import { destructiveResetAllowed, env } from '../helpers/env.js';

export default async function globalTeardown(_config: FullConfig): Promise<void> {
  if (process.env.E2E_ALLOW_DESTRUCTIVE_RESET === 'true' && !destructiveResetAllowed()) {
    throw new Error(`Destructive cleanup refused for database '${env.testDatabaseName}'. Use a dedicated name containing e2e or test.`);
  }
  // Normal test cleanup is API-based and registered per resource in LIFO order.
  // A guarded database reset is intentionally not automatic; see README.md.
}
